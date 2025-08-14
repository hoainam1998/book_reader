const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError, PrismaForeignConflict, PrismaDuplicateError } = require('#test/mocks/prisma-error');
const RedisClient = require('#services/redis-client/redis');
const { UpdateFavoriteBooksEvent } = require('#services/redis-client/events/events');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const addFavoriteBook = BookRoutePath.addFavoriteBook.abs;
const mockRequestBook = BookDummyData.MockRequestData;
const mockBook = BookDummyData.MockData;
const mockClient = ClientDummyData.MockData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;

const requestBody = {
  bookId: mockRequestBook.book_id,
};

describe('add favorite book', () => {
  commonTest(
    'add favorite book api common test',
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
        url: addFavoriteBook,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'add favorite book api cors',
        url: addFavoriteBook,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'add favorite book common test'
  );

  describe(createDescribeTest(METHOD.POST, addFavoriteBook), () => {
    test('add favorite book success', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();
      globalThis.prismaClient.favorite_books.findMany.mockResolvedValue(mockClient.favorite_books);

      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.CREATED)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledWith({
              data: {
                reader_id: sessionData.clientId,
                book_id: requestBody.bookId,
              },
            });
            expect(globalThis.prismaClient.favorite_books.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.favorite_books.findMany).toHaveBeenCalledWith({
              where: {
                reader_id: sessionData.clientId,
              },
              select: {
                book: {
                  select: {
                    book_id: true,
                    name: true,
                    avatar: true,
                    book_author: {
                      select: {
                        author: {
                          select: {
                            name: true,
                            author_id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            });
            expect(publish).toHaveBeenCalledTimes(1);
            const event = UpdateFavoriteBooksEvent.createEvent(mockClient.favorite_books, sessionData.clientId);
            expect(publish).toHaveBeenCalledWith(event.eventName, event.plainToObject);
            expect(response.body).toEqual({
              message: BOOK.ADD_FAVORITE_BOOK_SUCCESS,
            });
            done();
          });
      });
    });

    test('add favorite book failed with authentication token unset', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.favorite_books.create).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('add favorite book failed with session expired', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.favorite_books.create).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('add favorite book failed with request body are empty', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send({})
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.favorite_books.create).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.ADD_FAVORITE_BOOK_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('add favorite book failed with undefine request body field', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();
      // bookIds is undefine filed
      const undefineField = 'bookIds';
      const badRequestBody = { ...requestBody, [undefineField]: [Date.now.toString()] };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.favorite_books.create).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.ADD_FAVORITE_BOOK_FAIL),
              errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
            });
            done();
          });
      });
    });

    test.each([
      {
        describe: 'book not found',
        cause: PrismaNotFoundError,
        expected: {
          message: BOOK.BOOK_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'book do not exist',
        cause: new PrismaForeignConflict('book_id'),
        expected: {
          message: BOOK.BOOK_DO_NOT_EXIST,
        },
        status: HTTP_CODE.BAD_REQUEST,
      },
      {
        describe: 'favorite book already exist',
        cause: PrismaDuplicateError,
        expected: {
          message: BOOK.ADD_FAVORITE_BOOK_DUPLICATE,
        },
        status: HTTP_CODE.BAD_REQUEST,
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
    ])('add favorite book failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.favorite_books.create.mockRejectedValue(cause);
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledWith({
              data: {
                reader_id: sessionData.clientId,
                book_id: requestBody.bookId,
              },
            });
            expect(globalThis.prismaClient.favorite_books.findMany).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test('add favorite book failed with findMany method got server error', (done) => {
      globalThis.prismaClient.favorite_books.create.mockResolvedValue();
      globalThis.prismaClient.favorite_books.findMany.mockRejectedValue(ServerError);
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.SERVER_ERROR)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledWith({
              data: {
                reader_id: sessionData.clientId,
                book_id: requestBody.bookId,
              },
            });
            expect(globalThis.prismaClient.favorite_books.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.favorite_books.findMany).toHaveBeenCalledWith({
              where: {
                reader_id: sessionData.clientId,
              },
              select: {
                book: {
                  select: {
                    book_id: true,
                    name: true,
                    avatar: true,
                    book_author: {
                      select: {
                        author: {
                          select: {
                            name: true,
                            author_id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            });
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('add favorite book failed with output error', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();
      globalThis.prismaClient.favorite_books.findMany.mockResolvedValue(mockClient.favorite_books);
      globalThis.prismaClient.favorite_books.create.mockResolvedValue(mockBook);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addFavoriteBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.favorite_books.create).toHaveBeenCalledWith({
              data: {
                reader_id: sessionData.clientId,
                book_id: requestBody.bookId,
              },
            });
            expect(globalThis.prismaClient.favorite_books.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.favorite_books.findMany).toHaveBeenCalledWith({
              where: {
                reader_id: sessionData.clientId,
              },
              select: {
                book: {
                  select: {
                    book_id: true,
                    name: true,
                    avatar: true,
                    book_author: {
                      select: {
                        author: {
                          select: {
                            name: true,
                            author_id: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            });
            expect(publish).toHaveBeenCalledTimes(1);
            const event = UpdateFavoriteBooksEvent.createEvent(mockClient.favorite_books, sessionData.clientId);
            expect(publish).toHaveBeenCalledWith(event.eventName, event.plainToObject);
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });
  });
});
