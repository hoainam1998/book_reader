const { ServerError } = require('#test/mocks/other-errors');
const { PrismaForeignConflict } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { createDescribeTest } = require('#test/helpers/index');
const mockRequestBook = BookDummyData.MockRequestData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;
const bookId = mockRequestBook.book_id;
const deleteUsedReadBook = `${BookRoutePath.deleteUsedReadBook.abs}/${bookId}`;

const requestBody = {
  bookId: mockRequestBook.book_id,
};

describe('delete used read book', () => {
  commonTest('delete used read book api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.DELETE.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: deleteUsedReadBook,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'delete used read book api cors',
      url: deleteUsedReadBook,
      method: METHOD.DELETE.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'delete used read book common test');

  describe(createDescribeTest(METHOD.POST, deleteUsedReadBook), () => {
    test('delete used read book success', (done) => {
      globalThis.prismaClient.used_read.deleteMany.mockResolvedValue({ count: 1 });

      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteUsedReadBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledWith({
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
                message: BOOK.DELETE_USED_READ_BOOK_SUCCESS,
              });
              done();
            });
        });
    });

    test('delete used read book failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteUsedReadBook)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.used_read.deleteMany).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('delete used read book failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .delete(deleteUsedReadBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.used_read.deleteMany).not.toHaveBeenCalled();
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
    ])('delete used read book failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.used_read.deleteMany.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteUsedReadBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledWith({
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

    test('delete used read book failed with book not found', (done) => {
      globalThis.prismaClient.used_read.deleteMany.mockResolvedValue({ count: 0 });

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteUsedReadBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_FOUND)
            .then((response) => {
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledWith({
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

    test('delete used read book failed with output error', (done) => {
      globalThis.prismaClient.used_read.deleteMany.mockResolvedValue({ count: 1 });
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .delete(deleteUsedReadBook)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.used_read.deleteMany).toHaveBeenCalledWith({
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
