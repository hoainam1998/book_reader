const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError, PrismaForeignConflict, PrismaDuplicateError } = require('#test/mocks/prisma-error');
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
const addUsedReadBook = BookRoutePath.addUsedReadBook.abs;
const mockRequestBook = BookDummyData.MockRequestData;
const mockBook = BookDummyData.MockData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;

const requestBody = {
  bookId: mockRequestBook.book_id,
};

describe('add used read book', () => {
  commonTest(
    'add used read book api common test',
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
        url: addUsedReadBook,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'add used read book api cors',
        url: addUsedReadBook,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'add used read book common test'
  );

  describe(createDescribeTest(METHOD.POST, addUsedReadBook), () => {
    test('add used read book success', (done) => {
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addUsedReadBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.CREATED)
          .then((response) => {
            expect(globalThis.prismaClient.used_read.create).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.used_read.create).toHaveBeenCalledWith({
              data: {
                reader_id: sessionData.clientId,
                book_id: requestBody.bookId,
                added_at: expect.stringMatching(/^(\d){13}$/g),
              },
            });
            expect(response.body).toEqual({
              message: BOOK.ADD_USED_BOOK_SUCCESS,
            });
            done();
          });
      });
    });

    test('add used read book failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addUsedReadBook)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.used_read.create).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('add used read book failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(addUsedReadBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.used_read.create).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('add used read book failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addUsedReadBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send({})
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.used_read.create).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.ADD_USED_READ_BOOK_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('add used read book failed with undefine request body field', (done) => {
      // bookIds is undefine filed
      const undefineField = 'bookIds';
      const badRequestBody = { ...requestBody, [undefineField]: [Date.now.toString()] };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addUsedReadBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.used_read.create).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(BOOK.ADD_USED_READ_BOOK_FAIL),
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
        describe: 'used read already exist',
        cause: PrismaDuplicateError,
        expected: {
          message: BOOK.ADD_USED_READ_DUPLICATE,
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
    ])('add used read book failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.used_read.create.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addUsedReadBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(globalThis.prismaClient.used_read.create).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.used_read.create).toHaveBeenCalledWith({
              data: {
                reader_id: sessionData.clientId,
                book_id: requestBody.bookId,
                added_at: expect.stringMatching(/^(\d){13}$/g),
              },
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test('add used read book failed with output error', (done) => {
      globalThis.prismaClient.used_read.create.mockResolvedValue(mockBook);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(addUsedReadBook)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.used_read.create).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.used_read.create).toHaveBeenCalledWith({
              data: {
                reader_id: sessionData.clientId,
                book_id: requestBody.bookId,
                added_at: expect.stringMatching(/^(\d){13}$/g),
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
