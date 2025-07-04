const { ServerError } = require('#test/mocks/other-errors');
const CategoryDummyData = require('#test/resources/dummy-data/category');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const CategoryRoutePath = require('#services/route-paths/category');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, CATEGORY, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const { calcPages } = require('#utils');
const paginationUrl = CategoryRoutePath.pagination.abs;
const categoryLength = 2;

const requestBody = {
  query: {
    name: true,
    avatar: true,
    categoryId: true,
    disabled: true,
  },
  pageSize: 10,
  pageNumber: 1,
};

describe('category pagination', () => {
  commonTest('category pagination api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.CATEGORY}/unknown`,
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
      describe: 'category pagination api cors',
      url: paginationUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'category pagination common test');

  describe(createDescribeTest(METHOD.POST, paginationUrl), () => {
    test('category pagination success', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        CategoryDummyData.createMockCategoryList(categoryLength),
        categoryLength,
      ]);
      const categoryListExpected = CategoryDummyData.generateCategoryExpectedList(requestBody.query, categoryLength);

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
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  orderBy: {
                    category_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset,
                  include: {
                    _count: {
                      select: { book: true },
                    },
                  },
                })
              );
              expect(globalThis.prismaClient.category.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: categoryListExpected,
                total: categoryLength,
                page: requestBody.pageNumber,
                pageSize: requestBody.pageSize,
                pages: calcPages(requestBody.pageSize, categoryLength),
              });
              done();
            });
        });
    });

    test('category pagination failed categories are empty', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        [],
        0,
      ]);

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
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  orderBy: {
                    category_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset,
                  include: {
                    _count: {
                      select: { book: true },
                    },
                  },
                })
              );
              expect(globalThis.prismaClient.category.count).toHaveBeenCalledTimes(1);
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

    test('category pagination failed authentication token unset', (done) => {
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
              expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.category.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('category pagination failed session expired', (done) => {
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
              expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.category.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('category pagination failed with request body are empty', (done) => {
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
              expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.category.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.LOAD_CATEGORIES_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('category pagination failed with request body are missing field', (done) => {
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
              expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.category.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.LOAD_CATEGORIES_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('category pagination failed with undefine request body field', (done) => {
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
              expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.category.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.LOAD_CATEGORIES_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
              });
              done();
            });
        });
    });

    test('category pagination failed with output validate error', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        CategoryDummyData.createMockCategoryList(categoryLength),
        categoryLength,
      ]);

      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

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
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  orderBy: {
                    category_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset,
                  include: {
                    _count: {
                      select: { book: true },
                    },
                  },
                })
              );
              expect(globalThis.prismaClient.category.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL,
              });
              done();
            });
        });
    });

    test('category pagination failed with server error', (done) => {
      globalThis.prismaClient.$transaction.mockRejectedValue(ServerError);

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
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  orderBy: {
                    category_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset,
                  include: {
                    _count: {
                      select: { book: true },
                    },
                  },
                })
              );
              expect(globalThis.prismaClient.category.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });
  });
});
