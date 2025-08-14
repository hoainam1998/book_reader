const { ServerError } = require('#test/mocks/other-errors');
const AuthorDummyData = require('#test/resources/dummy-data/author');
const ClientDummyData = require('#test/resources/dummy-data/client');
const RedisClient = require('#services/redis-client/redis');
const OutputValidate = require('#services/output-validate');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const AuthorRoutePath = require('#services/route-paths/author');
const { HTTP_CODE, METHOD, PATH, REDIS_KEYS } = require('#constants');
const { USER, AUTHOR, COMMON } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const menu = AuthorRoutePath.menu.abs;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;
const authorLength = 2;

const requestBody = {
  query: {
    name: true,
    avatar: true,
    authorId: true,
  },
};

describe('author menu', () => {
  commonTest(
    'author menu api common test',
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
        url: menu,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'author menu api cors',
        url: menu,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.CLIENT_ORIGIN_CORS,
      },
    ],
    'author menu common test'
  );

  describe(createDescribeTest(METHOD.POST, menu), () => {
    test('author menu success when get data from database', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const authorListExpected = AuthorDummyData.generateAuthorExpectedList(requestBody.query, authorLength);
      const authorJsonListExpected = AuthorDummyData.createMockAuthorJsonList(authorLength);
      globalThis.prismaClient.author.findMany.mockResolvedValue(AuthorDummyData.createMockAuthorList(authorLength));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              where: {
                book_author: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, authorJsonListExpected);
            expect(response.body).toEqual(authorListExpected);
            done();
          });
      });
    });

    test('author menu success when get data from cache data', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue(AuthorDummyData.createMockAuthorJsonList(authorLength));
      const authorListExpected = AuthorDummyData.generateAuthorExpectedList(requestBody.query, authorLength);
      globalThis.prismaClient.author.findMany.mockResolvedValue(AuthorDummyData.createMockAuthorList(authorLength));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual(authorListExpected);
            done();
          });
      });
    });

    test('author menu failed with authors are empty', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.author.findMany.mockResolvedValue([]);
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              where: {
                book_author: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual([]);
            done();
          });
      });
    });

    test('author menu failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('author menu failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('author menu failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send({})
          .then((response) => {
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.MENU),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('author menu failed with undefine request body field', (done) => {
      // search is undefine field
      const undefineField = 'search';
      const badRequestBody = { ...requestBody, [undefineField]: '' };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(badRequestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(AUTHOR.MENU),
              errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
            });
            done();
          });
      });
    });

    test('author menu failed with output validate error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue(AuthorDummyData.createMockAuthorJsonList(authorLength));
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('author menu failed with lRange method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.author.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('author menu failed with findMany method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      globalThis.prismaClient.author.findMany.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              where: {
                book_author: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('author menu failed with rPush method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      globalThis.prismaClient.author.findMany.mockResolvedValue(AuthorDummyData.createMockAuthorList(authorLength));
      RedisClient.Instance.Client.rPush.mockRejectedValue(ServerError);
      const authorJsonListExpected = AuthorDummyData.createMockAuthorJsonList(authorLength);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              where: {
                book_author: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, authorJsonListExpected);
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('author menu failed with del method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      globalThis.prismaClient.author.findMany.mockResolvedValue(AuthorDummyData.createMockAuthorList(authorLength));
      RedisClient.Instance.Client.del.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS, 0, -1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.author.findMany).toHaveBeenCalledWith({
              where: {
                book_author: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.AUTHORS);
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
