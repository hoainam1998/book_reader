const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const AuthorDummyData = require('#test/resources/dummy-data/author');
const OutputValidate = require('#services/output-validate');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { AUTHOR, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const authorDetailUrl = `${PATH.AUTHOR}/detail`;

const mockAuthor = AuthorDummyData.MockData;
const requestBody = {
  authorId: mockAuthor.author_id,
  query: {
    name: true,
    sex: true,
    avatar: true,
    yearOfBirth: true,
    yearOfDead: true,
    storyFile: {
      html: true,
      json: true,
    },
  },
};

describe('author detail', () => {
  commonTest('get author detail api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: authorDetailUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'get author detail api cors',
      url: authorDetailUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'get author detail common test');

  describe(createDescribeTest(METHOD.POST, authorDetailUrl), () => {
    test('get author detail will be success', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      const expectedUser = AuthorDummyData.generateExpectedObject(requestBody.query);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: requestBody.authorId,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual(expectedUser);
              done();
            });
        });
    });

    test('get author detail failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('get author detail failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('get author detail failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.LOAD_AUTHOR_DETAIL_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY,]
              });
              done();
            });
        });
    });

    test('get author detail failed with undefine request body field', (done) => {
      const undefineField = 'authorIds';
      const badRequestBody = {
        ...requestBody,
        [undefineField]: []
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.LOAD_AUTHOR_DETAIL_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
              });
              done();
            });
        });
    });

    test('get author detail failed with the request body is missing field', (done) => {
      // missing authorId
      const badRequestBody = { ...requestBody };
      delete badRequestBody.authorId;

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.author.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(AUTHOR.LOAD_AUTHOR_DETAIL_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('get author detail failed with output validate error', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.author.findUniqueOrThrow.mockResolvedValue(mockAuthor);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: requestBody.authorId,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL,
              });
              done();
            });
        });
    });

    test('get author detail failed with author not found', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.author.findUniqueOrThrow.mockRejectedValue(PrismaNotFoundError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_FOUND)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: requestBody.authorId,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual({
                message: AUTHOR.AUTHOR_NOT_FOUND,
              });
              done();
            });
        });
    });

    test('get author detail failed with server error', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.author.findUniqueOrThrow.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(authorDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.author.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  author_id: requestBody.authorId,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });
  });
});
