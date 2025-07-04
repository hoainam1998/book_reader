const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const CategoryDummyData = require('#test/resources/dummy-data/category');
const OutputValidate = require('#services/output-validate');
const CategoryRoutePath = require('#services/route-paths/category');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { CATEGORY, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const getCategoryDetailUrl = CategoryRoutePath.detail.abs;
const mockCategory = CategoryDummyData.MockData;

const requestBody = {
  categoryId: mockCategory.category_id,
  query: {
    name: true,
    avatar: true,
  },
};

describe('get category detail', () => {
  commonTest('get category detail api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.CATEGORY}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: getCategoryDetailUrl ,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'get category detail api cors',
      url: getCategoryDetailUrl ,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'get category detail common test');

  describe(createDescribeTest(METHOD.POST, getCategoryDetailUrl ), () => {
    test('get category detail success', (done) => {
      globalThis.prismaClient.category.findUniqueOrThrow.mockResolvedValue(mockCategory);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const expectedCategory = CategoryDummyData.generateExpectedObject(requestBody.query);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.category.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  category_id: mockCategory.category_id,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual(expectedCategory);
              done();
            });
        });
    });

    test('get category detail failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl )
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.category.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('get category detail failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl )
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.category.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('get category detail failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl )
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.LOAD_CATEGORY_DETAIL_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('get category detail failed with request body are missing field', (done) => {
      // missing categoryId
      const badRequestBody = { ...requestBody };
      delete badRequestBody.categoryId;

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl )
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.LOAD_CATEGORY_DETAIL_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('get category detail failed with undefine request body field', (done) => {
      // categoryIds is undefine filed
      const undefineField = 'categoryIds';
      const badRequestBody = { ...requestBody, [undefineField]: [Date.now.toString()] };

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl )
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.LOAD_CATEGORY_DETAIL_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
              });
              done();
            });
        });
    });

    test.each([
      {
        describe: 'category not found',
        cause: PrismaNotFoundError,
        expected: {
          message: CATEGORY.CATEGORY_NOT_FOUND
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
    ])('get category detail failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.category.findUniqueOrThrow.mockRejectedValue(cause);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl )
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.category.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  category_id: mockCategory.category_id,
                },
                select: selectExpected,
              });
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });

    test('get category detail failed with output error', (done) => {
      globalThis.prismaClient.category.findUniqueOrThrow.mockResolvedValue(mockCategory);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(getCategoryDetailUrl )
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.category.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  category_id: mockCategory.category_id,
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
