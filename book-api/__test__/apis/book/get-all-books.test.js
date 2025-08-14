const { ServerError } = require('#test/mocks/other-errors');
const BookDummyData = require('#test/resources/dummy-data/book');
const RedisClient = require('#services/redis-client/redis');
const OutputValidate = require('#services/output-validate');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH, REDIS_KEYS } = require('#constants');
const { USER, BOOK, COMMON } = require('#messages');
const { sessionData, authenticationToken, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const getAllBooksUrl = BookRoutePath.all.abs;
const bookLength = 2;

const requestBody = {
  query: {
    name: true,
    pdf: true,
    publishedTime: true,
    publishedDay: true,
    categoryId: true,
    avatar: true,
    introduce: {
      html: true,
      json: true,
    },
    category: {
      categoryId: true,
      name: true,
      avatar: true,
    },
    images: {
      image: true,
      name: true,
    },
    authors: {
      authorId: true,
      name: true,
      avatar: true,
    },
  },
};

describe('get all books', () => {
  commonTest(
    'get all books api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.BOOK}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: getAllBooksUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'get all books api cors',
        url: getAllBooksUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'get all books common test'
  );

  describe(createDescribeTest(METHOD.POST, getAllBooksUrl), () => {
    test('get all books success when get data from database', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const bookListExpected = BookDummyData.generateBookExpectedList(requestBody.query, bookLength);
      const bookJsonListExpected = BookDummyData.createMockBookJsonList(bookLength);
      globalThis.prismaClient.book.findMany.mockResolvedValue(BookDummyData.createMockBookList(bookLength));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, 0, -1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, bookJsonListExpected);
            expect(response.body).toEqual(bookListExpected);
            done();
          });
      });
    });

    test('get all books success when get data from cache data', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue(BookDummyData.createMockBookJsonList(bookLength));
      const bookListExpected = BookDummyData.generateBookExpectedList(requestBody.query, bookLength);
      globalThis.prismaClient.book.findMany.mockResolvedValue(BookDummyData.createMockBookList(bookLength));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, 0, -1);
            expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual(bookListExpected);
            done();
          });
      });
    });

    test('get all books success with excludeIds', (done) => {
      const newRequestBody = {
        ...requestBody,
        excludeIds: [Date.now().toString()],
      };

      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const bookListExpected = BookDummyData.generateBookExpectedList(requestBody.query, bookLength);
      globalThis.prismaClient.book.findMany.mockResolvedValue(BookDummyData.createMockBookList(bookLength));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(newRequestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith({
              where: {
                book_id: {
                  notIn: newRequestBody.excludeIds,
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual(bookListExpected);
            done();
          });
      });
    });

    test('get all books failed with books are empty', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.book.findMany.mockResolvedValue([]);
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, 0, -1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual([]);
            done();
          });
      });
    });

    test('get all books failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('get all books failed session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('get all books failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send({})
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.LOAD_ALL_BOOK_FAILED),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('get all books failed with undefine request body field', (done) => {
      // search is undefine field
      const undefineField = 'search';
      const badRequestBody = { ...requestBody, [undefineField]: '' };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(badRequestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.LOAD_ALL_BOOK_FAILED),
              errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
            });
            done();
          });
      });
    });

    test('get all books failed with output validate error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue(BookDummyData.createMockBookJsonList(bookLength));
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, 0, -1);
            expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('get all books failed with lRange method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, 0, -1);
            expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('get all books failed with findMany method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      globalThis.prismaClient.book.findMany.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, 0, -1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith({
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

    test('get all books failed with rPush method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      globalThis.prismaClient.book.findMany.mockResolvedValue(BookDummyData.createMockBookList(bookLength));
      RedisClient.Instance.Client.rPush.mockRejectedValue(ServerError);
      const bookJsonListExpected = BookDummyData.createMockBookJsonList(bookLength);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllBooksUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, 0, -1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(REDIS_KEYS.BOOKS);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledWith(REDIS_KEYS.BOOKS, bookJsonListExpected);
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
