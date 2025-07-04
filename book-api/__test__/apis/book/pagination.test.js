const { ServerError } = require('#test/mocks/other-errors');
const BookDummyData = require('#test/resources/dummy-data/book');
const GraphqlResponse = require('#dto/common/graphql-response');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const BookRoutePath = require('#services/route-paths/book');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, BOOK, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const { calcPages } = require('#utils');
const paginationUrl = BookRoutePath.pagination.abs;
const bookLength = 2;

BookDummyData.ExpectedTypes = Object.assign(BookDummyData.ExpectedTypes, { introduce: expect.any(String) });

const requestBody = {
  query: {
    bookId: true,
    name: true,
    pdf: true,
    publishedTime: true,
    publishedDay: true,
    category: {
      name: true,
      avatar: true,
      categoryId: true,
    },
    introduce: true,
    avatar: true,
  },
  pageSize: 10,
  pageNumber: 1,
};

describe('book pagination', () => {
  commonTest('book pagination api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.BOOK}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: paginationUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'book pagination api cors',
      url: paginationUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'book pagination common test');

  describe(createDescribeTest(METHOD.POST, paginationUrl), () => {
    test('book pagination success', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        BookDummyData.createMockBookList(bookLength),
        bookLength,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const bookListExpected = BookDummyData.generateBookExpectedList(requestBody.query, bookLength);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: selectExpected,
                  orderBy: {
                    book_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: bookListExpected,
                total: bookLength,
                page: requestBody.pageNumber,
                pageSize: requestBody.pageSize,
                pages: calcPages(requestBody.pageSize, bookLength),
              });
              done();
            });
        });
    });

    test('book pagination success with search key', (done) => {
      const requestBodyWithKeyValue = {
        ...requestBody,
        keyword: 'book name'
      };

      globalThis.prismaClient.$transaction.mockResolvedValue([
        BookDummyData.createMockBookList(bookLength),
        bookLength,
      ]);

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const bookListExpected = BookDummyData.generateBookExpectedList(requestBodyWithKeyValue.query, bookLength);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBodyWithKeyValue)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: selectExpected,
                  where: {
                    name: {
                      contains: requestBodyWithKeyValue.keyword
                    }
                  },
                  orderBy: {
                    book_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset,
                })
              );
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    name: {
                      contains: requestBodyWithKeyValue.keyword
                    }
                  }
                })
              );
              expect(response.body).toEqual({
                list: bookListExpected,
                total: bookLength,
                page: requestBody.pageNumber,
                pageSize: requestBody.pageSize,
                pages: calcPages(requestBody.pageSize, bookLength),
              });
              done();
            });
        });
    });

    test('book pagination success when filter with categoryId', (done) => {
      const requestBodyWithKeyValue = {
        ...requestBody,
        by: {
          categoryId: Date.now().toString(),
        },
      };

      globalThis.prismaClient.$transaction.mockResolvedValue([
        BookDummyData.createMockBookList(bookLength),
        bookLength,
      ]);

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const bookListExpected = BookDummyData.generateBookExpectedList(requestBodyWithKeyValue.query, bookLength);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBodyWithKeyValue)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: selectExpected,
                  where: {
                    category_id: requestBodyWithKeyValue.by.categoryId,
                  },
                  orderBy: {
                    book_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset,
                })
              );
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    category_id: requestBodyWithKeyValue.by.categoryId,
                  }
                })
              );
              expect(response.body).toEqual({
                list: bookListExpected,
                total: bookLength,
                page: requestBody.pageNumber,
                pageSize: requestBody.pageSize,
                pages: calcPages(requestBody.pageSize, bookLength),
              });
              done();
            });
        });
    });

    test('book pagination success when filter with authorId', (done) => {
      const requestBodyWithKeyValue = {
        ...requestBody,
        by: {
          authorId: Date.now().toString(),
        },
      };

      globalThis.prismaClient.$transaction.mockResolvedValue([
        BookDummyData.createMockBookList(bookLength),
        bookLength,
      ]);

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const bookListExpected = BookDummyData.generateBookExpectedList(requestBodyWithKeyValue.query, bookLength);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBodyWithKeyValue)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: selectExpected,
                  where: {
                    book_author: {
                      some: {
                        author_id: requestBodyWithKeyValue.by.authorId,
                      }
                    }
                  },
                  orderBy: {
                    book_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset,
                })
              );
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    book_author: {
                      some: {
                        author_id: requestBodyWithKeyValue.by.authorId,
                      }
                    }
                  }
                })
              );
              expect(response.body).toEqual({
                list: bookListExpected,
                total: bookLength,
                page: requestBody.pageNumber,
                pageSize: requestBody.pageSize,
                pages: calcPages(requestBody.pageSize, bookLength),
              });
              done();
            });
        });
    });

    test('book pagination failed books are empty', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        [],
        0,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.NOT_FOUND)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: selectExpected,
                  orderBy: {
                    book_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: [],
                total: 0,
                page: requestBody.pageNumber,
                pageSize: requestBody.pageSize,
                pages: calcPages(requestBody.pageSize, 0),
              });
              done();
            });
        });
    });

    test('book pagination failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('book pagination failed session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('book pagination failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send({})
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.LOAD_BOOKS_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('book pagination failed with request body are missing field', (done) => {
      // missing query field.
      const badRequestBody = {
        pageSize: requestBody.pageSize,
        pageNumber: requestBody.pageNumber,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send(badRequestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.LOAD_BOOKS_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('book pagination failed with undefine request body field', (done) => {
      // search is undefine field
      const undefineField = 'search';
      const badRequestBody = { ...requestBody, [undefineField]: '' };

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send(badRequestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.book.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(BOOK.LOAD_BOOKS_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
              });
              done();
            });
        });
    });

    test('book pagination failed with output validate error', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        BookDummyData.createMockBookList(bookLength),
        bookLength,
      ]);

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({
          data: {
            list: [],
            total: 0,
          }
        })
      );
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: selectExpected,
                  orderBy: {
                    book_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL,
              });
              done();
            });
        });
    });

    test('book pagination failed with server error', (done) => {
      globalThis.prismaClient.$transaction.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.SERVER_ERROR)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.book.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: selectExpected,
                  orderBy: {
                    book_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.book.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });
  });
});
