const { ServerError } = require('#test/mocks/other-errors');
const OutputValidate = require('#services/output-validate');
const AuthorDummyData = require('#test/resources/dummy-data/author');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const AuthorRoutePath = require('#services/route-paths/author');
const { calcPages } = require('#utils');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, AUTHOR, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const paginationUrl = AuthorRoutePath.pagination.abs;
const authorLength = 2;

AuthorDummyData.ExpectedTypes = Object.assign(AuthorDummyData.ExpectedTypes, { storyFile: expect.any(String) });

const requestBody = {
  query: {
    authorId: true,
    name: true,
    sex: true,
    avatar: true,
    storyFile: true,
    yearOfBirth: true,
    yearOfDead: true,
  },
  pageSize: 10,
  pageNumber: 1,
};

describe('author pagination', () => {
  commonTest(
    'author pagination api common test',
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
        url: paginationUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'author pagination api cors',
        url: paginationUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'author pagination common test'
  );

  describe(createDescribeTest(METHOD.POST, paginationUrl), () => {
    test('author pagination success', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        AuthorDummyData.createMockAuthorList(authorLength),
        authorLength,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const authorListExpected = AuthorDummyData.generateAuthorExpectedList(requestBody.query, authorLength);

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
              orderBy: {
                author_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.author.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              list: authorListExpected,
              total: authorLength,
              page: requestBody.pageNumber,
              pages: calcPages(requestBody.pageSize, authorLength),
              pageSize: requestBody.pageSize,
            });
            done();
          });
      });
    });

    test('author pagination success with search key', (done) => {
      const requestBodyWithSearchKey = {
        ...requestBody,
        keyword: 'author name',
      };

      globalThis.prismaClient.$transaction.mockResolvedValue([
        AuthorDummyData.createMockAuthorList(authorLength),
        authorLength,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const authorListExpected = AuthorDummyData.generateAuthorExpectedList(requestBody.query, authorLength);

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBodyWithSearchKey)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
              where: {
                name: {
                  contains: requestBodyWithSearchKey.keyword,
                },
              },
              orderBy: {
                author_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.author.count).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.count).toHaveBeenCalledWith({
              where: {
                name: {
                  contains: requestBodyWithSearchKey.keyword,
                },
              },
            });
            expect(response.body).toEqual({
              list: authorListExpected,
              total: authorLength,
              page: requestBody.pageNumber,
              pages: calcPages(requestBody.pageSize, authorLength),
              pageSize: requestBody.pageSize,
            });
            done();
          });
      });
    });

    test('author pagination failed with authentication token unset', (done) => {
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('author pagination failed with session expired', (done) => {
      destroySession().then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('author pagination failed with authors are empty', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([[], 0]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
              orderBy: {
                author_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.author.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              list: [],
              total: 0,
              page: requestBody.pageNumber,
              pages: calcPages(requestBody.pageSize, 0),
              pageSize: requestBody.pageSize,
            });
            done();
          });
      });
    });

    test('author pagination failed with request body are empty', (done) => {
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.LOAD_AUTHORS_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('author pagination failed with request body is missing field', (done) => {
      // missing query field.
      const badRequestBody = { ...requestBody };
      delete badRequestBody.query;

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.LOAD_AUTHORS_FAIL),
              errors: expect.any(Array),
            });
            done();
          });
      });
    });

    test('author pagination failed with undefine request body field', (done) => {
      // authorId is undefine field
      const undefineField = 'authorId';
      const badRequestBody = { ...requestBody, [undefineField]: Date.now().toString() };

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.LOAD_AUTHORS_FAIL),
              errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
            });
            done();
          });
      });
    });

    test('author pagination failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      globalThis.prismaClient.$transaction.mockResolvedValue([
        AuthorDummyData.createMockAuthorList(authorLength),
        authorLength,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
              orderBy: {
                author_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.author.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('author pagination failed with server error', (done) => {
      globalThis.prismaClient.$transaction.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              select: selectExpected,
              orderBy: {
                author_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.author.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
