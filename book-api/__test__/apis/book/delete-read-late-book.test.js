const { ServerError } = require('#test/mocks/other-errors');
const { PrismaForeignConflict } = require('#test/mocks/prisma-error');
const RedisClient = require('#services/redis-client/redis');
const { UpdateReadLateBooksEvent } = require('#services/redis-client/events/events');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const mockRequestBook = BookDummyData.MockRequestData;
const mockClient = ClientDummyData.MockData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;
const bookId = mockRequestBook.book_id;
const deleteReadLateBook = `${BookRoutePath.deleteReadLateBook.abs}/${bookId}`;

const requestBody = {
  bookId: mockRequestBook.book_id,
};

describe('delete read late book', () => {
  commonTest(
    'delete read late book api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.BOOK}/unknown`,
        method: METHOD.DELETE.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: deleteReadLateBook,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'delete read late book api cors',
        url: deleteReadLateBook,
        method: METHOD.DELETE.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'delete read late book common test'
  );

  describe(createDescribeTest(METHOD.POST, deleteReadLateBook), () => {
    test('delete read late book success', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();
      globalThis.prismaClient.read_late.findMany.mockResolvedValue(mockClient.read_late);
      globalThis.prismaClient.read_late.deleteMany.mockResolvedValue({ count: 1 });

      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.OK)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledWith({
              where: {
                AND: [
                  {
                    book_id: bookId,
                  },
                  {
                    reader_id: sessionData.clientId,
                  },
                ],
              },
            });
            expect(globalThis.prismaClient.read_late.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.findMany).toHaveBeenCalledWith({
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
                added_at: true,
              },
            });
            expect(publish).toHaveBeenCalledTimes(1);
            const event = UpdateReadLateBooksEvent.createEvent(mockClient.read_late, sessionData.clientId);
            expect(publish).toHaveBeenCalledWith(event.eventName, event.plainToObject);
            expect(response.body).toEqual({
              message: BOOK.DELETE_READ_LATE_BOOK_SUCCESS,
            });
            done();
          });
      });
    });

    test('delete read late book failed with authentication token unset', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBook)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.read_late.findMany).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('delete read late book failed with session expired', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.read_late.findMany).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('delete read late book failed with invalid request param', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();
      const deleteReadLateBookWithInvalidRequestParam = `${BookRoutePath.deleteReadLateBook.abs}/unknown`;

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBookWithInvalidRequestParam)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.read_late.findMany).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.DELETE_READ_LATE_BOOK_FAIL),
              errors: expect.arrayContaining([expect.any(String)]),
            });
            done();
          });
      });
    });

    test.each([
      {
        describe: 'book do not exist',
        cause: new PrismaForeignConflict('book_id'),
        expected: {
          message: BOOK.BOOK_DO_NOT_EXIST,
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
    ])('delete read late book failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.read_late.deleteMany.mockRejectedValue(cause);
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledWith({
              where: {
                AND: [
                  {
                    book_id: bookId,
                  },
                  {
                    reader_id: sessionData.clientId,
                  },
                ],
              },
            });
            expect(globalThis.prismaClient.read_late.findMany).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test('delete read late book failed with book not found', (done) => {
      globalThis.prismaClient.read_late.deleteMany.mockResolvedValue({ count: 0 });
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.NOT_FOUND)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledWith({
              where: {
                AND: [
                  {
                    book_id: bookId,
                  },
                  {
                    reader_id: sessionData.clientId,
                  },
                ],
              },
            });
            expect(globalThis.prismaClient.read_late.findMany).not.toHaveBeenCalled();
            expect(publish).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: BOOK.BOOK_NOT_FOUND,
            });
            done();
          });
      });
    });

    test('delete read late book failed with finMany method got server error', (done) => {
      globalThis.prismaClient.read_late.deleteMany.mockResolvedValue({ count: 1 });
      globalThis.prismaClient.read_late.findMany.mockRejectedValue(ServerError);
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.SERVER_ERROR)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledWith({
              where: {
                AND: [
                  {
                    book_id: bookId,
                  },
                  {
                    reader_id: sessionData.clientId,
                  },
                ],
              },
            });
            expect(globalThis.prismaClient.read_late.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.findMany).toHaveBeenCalledWith({
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
                added_at: true,
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

    test('delete read late book failed with output error', (done) => {
      const publish = jest.spyOn(RedisClient.Instance.redisClient, 'publish').mockResolvedValue();
      globalThis.prismaClient.read_late.deleteMany.mockResolvedValue({ count: 1 });
      globalThis.prismaClient.read_late.findMany.mockResolvedValue(mockClient.read_late);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .delete(deleteReadLateBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.deleteMany).toHaveBeenCalledWith({
              where: {
                AND: [
                  {
                    book_id: bookId,
                  },
                  {
                    reader_id: sessionData.clientId,
                  },
                ],
              },
            });
            expect(globalThis.prismaClient.read_late.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.read_late.findMany).toHaveBeenCalledWith({
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
                added_at: true,
              },
            });
            expect(publish).toHaveBeenCalledTimes(1);
            const event = UpdateReadLateBooksEvent.createEvent(mockClient.read_late, sessionData.clientId);
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
