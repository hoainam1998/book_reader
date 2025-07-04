const fs = require('fs');
const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const BookDummyData = require('#test/resources/dummy-data/book');
const OutputValidate = require('#services/output-validate');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { BOOK, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const updateIntroduceFileUrl = BookRoutePath.updateIntroduce.abs;
const mockBook = BookDummyData.MockData;

const requestBody = {
  html: '<div>content</div>',
  json: '{ json: "content" }',
  fileName: mockBook.name,
  bookId: mockBook.book_id,
};

describe('update introduce', () => {
  commonTest('update introduce api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: updateIntroduceFileUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'update introduce api cors',
      url: updateIntroduceFileUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'update introduce common test');

  describe(createDescribeTest(METHOD.POST, updateIntroduceFileUrl), () => {
    test('update introduce success', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      const [htmlFile, jsonFile] = mockBook.introduce_file.split(',');
      const htmlFilePath = htmlFile.trim().replace(/\//gm, '\\');
      const jsonFilePath = jsonFile.trim().replace(/\//gm, '\\');
      const bookName = mockBook.name.replace(/\s/, '-');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.CREATED)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  book_id: requestBody.bookId
                },
                select: {
                  introduce_file: true,
                },
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(`\\public\\${htmlFilePath}`),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`\\public\\${jsonFilePath}`),
                  expect.any(Function),
                ]
              ]);
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

    test('update introduce failed with authentication token unset', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(unLink).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('update introduce failed with session expired', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(unLink).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
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
        describe: 'book not found by findUniqueOrThrow method',
        expected: {
          message: BOOK.INTRODUCE_FILE_NOT_FOUND
        },
        cause: PrismaNotFoundError,
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error by findUniqueOrThrow method',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        cause: ServerError,
        status: HTTP_CODE.SERVER_ERROR,
      }
    ])('update introduce failed with $describe', ({ expected, cause, status }, done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book.findUniqueOrThrow.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  book_id: requestBody.bookId
                },
                select: {
                  introduce_file: true,
                },
              });
              expect(unLink).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(writeFile).not.toHaveBeenCalled();
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });

    test.each([
      {
        describe: 'book not found by update method',
        expected: {
          message: BOOK.INTRODUCE_FILE_NOT_FOUND
        },
        cause: PrismaNotFoundError,
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error by update method',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        cause: ServerError,
        status: HTTP_CODE.SERVER_ERROR,
      }
    ])('update introduce failed with $describe', ({ expected, cause, status }, done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const [htmlFile, jsonFile] = mockBook.introduce_file.split(',');
      const htmlFilePath = htmlFile.trim().replace(/\//gm, '\\');
      const jsonFilePath = jsonFile.trim().replace(/\//gm, '\\');
      const bookName = mockBook.name.replace(/\s/, '-');
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      globalThis.prismaClient.book.update.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  book_id: requestBody.bookId
                },
                select: {
                  introduce_file: true,
                },
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(`\\public\\${htmlFilePath}`),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`\\public\\${jsonFilePath}`),
                  expect.any(Function),
                ]
              ]);
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

    test('update introduce failed with request body are empty', (done) => {
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(unLink).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.UPDATE_INTRODUCE_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('update introduce failed with request body are missing field', (done) => {
      // missing bookId
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const badRequestBody = Object.assign({}, requestBody);
      delete badRequestBody.bookId;

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
              expect(unLink).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.UPDATE_INTRODUCE_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('update introduce failed with undefine request body', (done) => {
      // bookIds is undefine field
      const expectedFieldName = 'bookIds';
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      const badRequestBody = Object.assign({ [expectedFieldName]: [] }, requestBody);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(writeFile).not.toHaveBeenCalled();
              expect(unLink).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.UPDATE_INTRODUCE_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(expectedFieldName))]),
              });
              done();
            });
        });
    });

    test('update introduce failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const writeFile = jest.spyOn(fs, 'writeFile')
        .mockImplementation((filePath, content, callback) => callback());
      const unLink = jest.spyOn(fs, 'unlink').mockImplementation((_, callBack) => callBack());
      globalThis.prismaClient.book.update.mockResolvedValue(mockBook);
      globalThis.prismaClient.book.findUniqueOrThrow.mockResolvedValue(mockBook);
      const [htmlFile, jsonFile] = mockBook.introduce_file.split(',');
      const htmlFilePath = htmlFile.trim().replace(/\//gm, '\\');
      const jsonFilePath = jsonFile.trim().replace(/\//gm, '\\');
      const bookName = mockBook.name.replace(/\s/, '-');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .put(updateIntroduceFileUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  book_id: requestBody.bookId
                },
                select: {
                  introduce_file: true,
                },
              });
              expect(unLink).toHaveBeenCalledTimes(2);
              expect(unLink.mock.calls).toEqual([
                [
                  expect.stringContaining(`\\public\\${htmlFilePath}`),
                  expect.any(Function),
                ],
                [
                  expect.stringContaining(`\\public\\${jsonFilePath}`),
                  expect.any(Function),
                ]
              ]);
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
