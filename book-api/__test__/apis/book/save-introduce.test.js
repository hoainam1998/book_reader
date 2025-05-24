const fs = require('fs');
const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const OutputValidate = require('#services/output-validate');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const saveIntroduceFileUrl = `${PATH.BOOK}/save-introduce`;
const mockBook = BookDummyData.MockData;

const requestBody = {
  html: '<div>content</div>',
  json: '{ json: "content" }',
  fileName: mockBook.name,
  bookId: mockBook.book_id,
};

describe('save introduce', () => {
  commonTest('save introduce api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: saveIntroduceFileUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'save introduce api cors',
      url: saveIntroduceFileUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'save introduce common test');

  describe(createDescribeTest(METHOD.POST, saveIntroduceFileUrl), () => {
    test('save introduce success', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.CREATED)
            .then((response) => {
              const bookName = mockBook.name.replace(/\s/, '-');
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`\\public\\html\\${bookName}.html`),
                  requestBody.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`\\public\\json\\${bookName}.json`),
                  requestBody.json,
                  expect.any(Function),
                ]
              ]);
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
                where: {
                  book_id: mockBook.book_id,
                },
                data: {
                  introduce_file: `html/${bookName}.html,json/${bookName}.json`,
                }
              });
              expect(response.body).toEqual({
                message: BOOK.INTRODUCE_FILE_SAVE
              });
              done();
            });
        });
    });

    test('save introduce failed with authentication token unset', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('save introduce failed with session expired', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());

      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
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
        describe: 'book not found',
        expected: {
          message: BOOK.BOOK_NOT_FOUND
        },
        cause: PrismaNotFoundError,
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        cause: ServerError,
        status: HTTP_CODE.SERVER_ERROR,
      }
    ])('save introduce failed with $describe', ({ expected, cause, status }, done) => {
      globalThis.prismaClient.book.update.mockRejectedValue(cause);
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              const bookName = mockBook.name.replace(/\s/, '-');
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`\\public\\html\\${bookName}.html`),
                  requestBody.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`\\public\\json\\${bookName}.json`),
                  requestBody.json,
                  expect.any(Function),
                ]
              ]);
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
                where: {
                  book_id: mockBook.book_id,
                },
                data: {
                  introduce_file: `html/${bookName}.html,json/${bookName}.json`,
                }
              });
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });

    test('save introduce failed with request body are empty', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.SAVE_INTRODUCE_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('save introduce failed with request body are missing field', (done) => {
      // missing bookId
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const badRequestBody = Object.assign({}, requestBody);
      delete badRequestBody.bookId;

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.SAVE_INTRODUCE_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('save introduce failed with undefine request body field', (done) => {
      // bookIds is undefine field.
      const undefineField = 'bookIds';
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const badRequestBody = Object.assign({ [undefineField]: [] }, requestBody);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.SAVE_INTRODUCE_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
              });
              done();
            });
        });
    });

    test('save introduce failed with output validate error', (done) => {
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(saveIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              const bookName = mockBook.name.replace(/\s/, '-');
              expect(writeFile).toHaveBeenCalledTimes(2);
              expect(writeFile.mock.calls).toEqual([
                [
                  expect.stringContaining(`\\public\\html\\${bookName}.html`),
                  requestBody.html,
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`\\public\\json\\${bookName}.json`),
                  requestBody.json,
                  expect.any(Function),
                ]
              ]);
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.update).toHaveBeenCalledWith({
                where: {
                  book_id: mockBook.book_id,
                },
                data: {
                  introduce_file: `html/${bookName}.html,json/${bookName}.json`,
                }
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
