const { ServerError } = require('#test/mocks/other-errors');
const { PrismaForeignConflict } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { createDescribeTest } = require('#test/helpers/index');
const mockRequestBook = BookDummyData.MockRequestData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;
const bookId = mockRequestBook.book_id;
const deleteFavoriteBook = `${PATH.BOOK}/delete-favorite-book/${bookId}`;

const requestBody = {
  bookId: mockRequestBook.book_id,
};

describe('delete favorite book', () => {
  commonTest('delete favorite book api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.DELETE.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: deleteFavoriteBook,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'get book detail api cors',
      url: deleteFavoriteBook,
      method: METHOD.DELETE.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'delete favorite book common test');

  describe(createDescribeTest(METHOD.POST, deleteFavoriteBook), () => {
    test('delete favorite book success', (done) => {
      globalThis.prismaClient.favorite_books.deleteMany.mockResolvedValue({ count: 1 });

      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteFavoriteBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledWith({
                where: {
                  AND: [
                    {
                      book_id: bookId,
                    },
                    {
                      reader_id: sessionData.clientId,
                    }
                  ]
                }
              });
              expect(response.body).toEqual({
                message: BOOK.DELETE_FAVORITE_BOOK_SUCCESS,
              });
              done();
            });
        });
    });

    test('delete favorite book failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteFavoriteBook)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.favorite_books.deleteMany).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('delete favorite book failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .delete(deleteFavoriteBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.favorite_books.deleteMany).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
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
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('delete favorite book failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.favorite_books.deleteMany.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteFavoriteBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledWith({
                where: {
                  AND: [
                    {
                      book_id: bookId,
                    },
                    {
                      reader_id: sessionData.clientId,
                    }
                  ]
                },
              });
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });

    test('delete favorite book failed with book not found', (done) => {
      globalThis.prismaClient.favorite_books.deleteMany.mockResolvedValue({ count: 0 });

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteFavoriteBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_FOUND)
            .then((response) => {
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledWith({
                where: {
                  AND: [
                    {
                      book_id: bookId,
                    },
                    {
                      reader_id: sessionData.clientId,
                    }
                  ]
                },
              });
              expect(response.body).toEqual({
                message: BOOK.BOOK_NOT_FOUND,
              });
              done();
            });
        });
    });

    test('delete favorite book failed with output error', (done) => {
      globalThis.prismaClient.favorite_books.deleteMany.mockResolvedValue({ count: 1 });
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteFavoriteBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.favorite_books.deleteMany).toHaveBeenCalledWith({
                where: {
                  AND: [
                    {
                      book_id: bookId,
                    },
                    {
                      reader_id: sessionData.clientId,
                    }
                  ]
                },
              });
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL,
              });
              done();
            });
        });
    });
  });
});
