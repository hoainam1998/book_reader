const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const getBookDetailUrl = `${PATH.BOOK}/detail`;
const mockBook = BookDummyData.MockData;
const apiKey = ClientDummyData.apiKey;

const requestBody = {
  bookId: mockBook.book_id,
  query: {
    name: true,
    pdf: true,
    publishedTime: true,
    publishedDay: true,
    categoryId: true,
    avatar: true,
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
    introduce: {
      html: true,
      json: true,
    },
  },
};

describe('get book detail', () => {
  commonTest('get book detail api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: getBookDetailUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'get book detail api cors',
      url: getBookDetailUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'get book detail common test');

  describe(createDescribeTest(METHOD.POST, getBookDetailUrl), () => {
    test.each([
      {
        name: 'user',
        sessionData: sessionData.user,
        apiKey: authenticationToken,
      },
      {
        name: 'client',
        sessionData: ClientDummyData.session.client,
        apiKey,
      }
    ])('get book detail success with $name role', ({ name, sessionData, apiKey }, done) => {
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const expectedBook = BookDummyData.generateExpectedObject(requestBody.query);

      expect.hasAssertions();
      signedTestCookie(sessionData, name)
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  book_id: mockBook.book_id,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual(expectedBook);
              done();
            });
        });
    });

    test('get book detail failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('get book detail failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('get book detail failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send({})
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.LOAD_BOOK_DETAIL_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('get book detail failed with request body are missing field', (done) => {
      // missing bookId
      const badRequestBody = { ...requestBody };
      delete badRequestBody.bookId;

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.LOAD_BOOK_DETAIL_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('get book detail failed with undefine request body field', (done) => {
      // bookIds is undefine filed
      const undefineField = 'bookIds';
      const badRequestBody = { ...requestBody, [undefineField]: [Date.now.toString()] };

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.LOAD_BOOK_DETAIL_FAIL),
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
          message: BOOK.BOOK_NOT_FOUND
        },
        status: HTTP_CODE.NOT_FOUND
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('get book detail failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.book.findUniqueOrThrow.mockRejectedValue(cause);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  book_id: mockBook.book_id,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });

    test('get book detail failed with output error', (done) => {
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getBookDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  book_id: mockBook.book_id,
                },
                select: selectExpected,
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
