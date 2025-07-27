const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const OutputValidate = require('#services/output-validate');
const BookRoutePath = require('#services/route-paths/book');
const BookDummyData = require('#test/resources/dummy-data/book');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON, BOOK } = require('#messages');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const {
  authenticationToken,
  sessionData,
  mockUser,
  signedTestCookie,
  clearAllSession,
  destroySession,
} = require('#test/resources/auth');
const deleteBookId = Date.now().toString();
const deleteBookUrl = `${BookRoutePath.delete.abs}/${deleteBookId}`;
const mockBook = BookDummyData.MockData;

describe('delete book', () => {
  commonTest(
    'delete book api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.CLIENT}/unknown`,
        method: METHOD.DELETE.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: deleteBookUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'delete book api cors',
        url: deleteBookUrl,
        method: METHOD.DELETE.toLowerCase(),
        origin: process.env.CLIENT_ORIGIN_CORS,
      },
    ],
    'delete book common test'
  );

  describe(createDescribeTest(METHOD.DELETE, deleteBookUrl), () => {
    test('delete book will be success', (done) => {
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book.delete.mockResolvedValue(mockBook);

      expect.hasAssertions();
      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .delete(deleteBookUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
                where: {
                  book_id: deleteBookId,
                },
                data: {
                  book_image: {
                    deleteMany: {},
                  },
                  book_reader: {
                    deleteMany: {},
                  },
                  book_author: {
                    deleteMany: {},
                  },
                  favorite_books: {
                    deleteMany: {},
                  },
                  read_late: {
                    deleteMany: {},
                  },
                  used_read: {
                    deleteMany: {},
                  },
                },
              });
              expect(globalThis.prismaClient.book.delete).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.delete).toHaveBeenCalledWith({
                where: {
                  book_id: deleteBookId,
                },
              });
              expect(response.body).toEqual({
                message: BOOK.DELETE_BOOK_SUCCESS,
              });
              done();
            });
        });
      });
    });

    test('delete book failed with authentication token unset', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .delete(deleteBookUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
      });
    });

    test('delete book failed with session expired', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        destroySession().then((responseSign) => {
          globalThis.api
            .delete(deleteBookUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
      });
    });

    test('delete book failed with invalid request param', (done) => {
      const deleteBookUrlWithInvalidRequestParam =  `${BookRoutePath.delete.abs}/unknown`;
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .delete(deleteBookUrlWithInvalidRequestParam)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.DELETE_BOOK_FAIL),
                errors: expect.arrayContaining([expect.any(String)]),
              });
              done();
            });
        });
      });
    });

    test('delete book failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book.delete.mockResolvedValue(mockBook);

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteBookUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
              where: {
                book_id: deleteBookId,
              },
              data: {
                book_image: {
                  deleteMany: {},
                },
                book_reader: {
                  deleteMany: {},
                },
                book_author: {
                  deleteMany: {},
                },
                favorite_books: {
                  deleteMany: {},
                },
                read_late: {
                  deleteMany: {},
                },
                used_read: {
                  deleteMany: {},
                },
              },
            });
            expect(globalThis.prismaClient.book.delete).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.delete).toHaveBeenCalledWith({
              where: {
                book_id: deleteBookId,
              },
            });
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test.each([
      {
        describe: 'not found error',
        expected: {
          message: BOOK.BOOK_NOT_FOUND,
        },
        cause: PrismaNotFoundError,
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
        cause: ServerError,
      },
    ])('delete book failed with update method throw $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.book.update.mockRejectedValue(cause);
      globalThis.prismaClient.book.delete.mockResolvedValue(mockUser);

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteBookUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
              where: {
                book_id: deleteBookId,
              },
              data: {
                book_image: {
                  deleteMany: {},
                },
                book_reader: {
                  deleteMany: {},
                },
                book_author: {
                  deleteMany: {},
                },
                favorite_books: {
                  deleteMany: {},
                },
                read_late: {
                  deleteMany: {},
                },
                used_read: {
                  deleteMany: {},
                },
              },
            });
            expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test.each([
      {
        describe: 'not found error',
        expected: {
          message: BOOK.BOOK_NOT_FOUND,
        },
        cause: PrismaNotFoundError,
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
        cause: ServerError,
      },
    ])('delete book failed with delete method throw $describe', ({ expected, status, cause }, done) => {
      globalThis.prismaClient.book.delete.mockRejectedValue(cause);
      globalThis.prismaClient.book.update.mockResolvedValue(mockUser);

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteBookUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
              where: {
                book_id: deleteBookId,
              },
              data: {
                book_image: {
                  deleteMany: {},
                },
                book_reader: {
                  deleteMany: {},
                },
                book_author: {
                  deleteMany: {},
                },
                favorite_books: {
                  deleteMany: {},
                },
                read_late: {
                  deleteMany: {},
                },
                used_read: {
                  deleteMany: {},
                },
              },
            });
            expect(globalThis.prismaClient.book.delete).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.book.delete).toHaveBeenCalledWith({
              where: {
                book_id: deleteBookId,
              },
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
