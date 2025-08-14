const { ServerError } = require('#test/mocks/other-errors');
const AuthorDummyData = require('#test/resources/dummy-data/author');
const OutputValidate = require('#services/output-validate');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const AuthorRoutePath = require('#services/route-paths/author');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, AUTHOR, COMMON } = require('#messages');
const { signedTestCookie, destroySession, authenticationToken, sessionData } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const filterAuthorUrl = AuthorRoutePath.filter.abs;
const authorLength = 2;

const requestBody = {
  query: {
    name: true,
    avatar: true,
    authorId: true,
  },
};

describe('filter authors', () => {
  commonTest(
    'filter authors api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.AUTHOR}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: filterAuthorUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'filter authors api cors',
        url: filterAuthorUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'filter authors common test'
  );

  describe(createDescribeTest(METHOD.POST, filterAuthorUrl), () => {
    test('filter authors success', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const authorListExpected = AuthorDummyData.generateAuthorExpectedList(requestBody.query, authorLength);
      globalThis.prismaClient.author.findMany.mockResolvedValue(AuthorDummyData.createMockAuthorList(authorLength));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(response.body).toEqual(authorListExpected);
            done();
          });
      });
    });

    test('filter authors success', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const authorListExpected = AuthorDummyData.generateAuthorExpectedList(requestBody.query, authorLength);
      globalThis.prismaClient.author.findMany.mockResolvedValue(AuthorDummyData.createMockAuthorList(authorLength));

      const requestBodyWithAuthorIds = {
        ...requestBody,
        authorIds: [Date.now().toString()],
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBodyWithAuthorIds)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
              where: {
                author_id: {
                  in: requestBodyWithAuthorIds.authorIds,
                },
              },
            });
            expect(response.body).toEqual(authorListExpected);
            done();
          });
      });
    });

    test('filter authors failed with authors are empty', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.author.findMany.mockResolvedValue([]);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(response.body).toEqual([]);
            done();
          });
      });
    });

    test('filter authors failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('filter authors failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('filter authors failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send({})
          .then((response) => {
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.FILTER_AUTHORS_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('filter authors failed with undefine request body field', (done) => {
      // search is undefine field
      const undefineField = 'search';
      const badRequestBody = { ...requestBody, [undefineField]: '' };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(badRequestBody)
          .then((response) => {
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.FILTER_AUTHORS_FAIL),
              errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
            });
            done();
          });
      });
    });

    test('filter authors failed with output validate error', (done) => {
      globalThis.prismaClient.author.findMany.mockResolvedValue(AuthorDummyData.createMockAuthorList(authorLength));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('filter authors failed with findMany method got server error', (done) => {
      globalThis.prismaClient.author.findMany.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(filterAuthorUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
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
