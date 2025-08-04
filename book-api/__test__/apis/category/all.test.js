const { ServerError } = require('#test/mocks/other-errors');
const CategoryDummyData = require('#test/resources/dummy-data/category');
const RedisClient = require('#services/redis-client/redis');
const OutputValidate = require('#services/output-validate');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const CategoryRoutePath = require('#services/route-paths/category');
const { HTTP_CODE, METHOD, PATH, REDIS_KEYS } = require('#constants');
const { USER, CATEGORY, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const getAllCategory = CategoryRoutePath.all.abs;
const categoryLength = 2;

const requestBody = {
  query: {
    name: true,
    avatar: true,
    categoryId: true,
  },
};

describe('get all category', () => {
  commonTest(
    'get all category api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.CATEGORY}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: getAllCategory,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'get all category api cors',
        url: getAllCategory,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'get all category common test'
  );

  describe(createDescribeTest(METHOD.POST, getAllCategory), () => {
    test('get all category success by get caching data', (done) => {
      const categoryListExpected = CategoryDummyData.generateCategoryExpectedList(requestBody.query, categoryLength);
      RedisClient.Instance.Client.lRange.mockResolvedValue(
        CategoryDummyData.createMockCategoryJsonList(categoryLength)
      );

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.CATEGORIES, 0, -1);
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual(categoryListExpected);
            done();
          });
      });
    });

    test('get all category success by get database data', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const categoryListExpected = CategoryDummyData.generateCategoryExpectedList(requestBody.query, categoryLength);
      globalThis.prismaClient.category.findMany.mockResolvedValue(
        CategoryDummyData.createMockCategoryList(categoryLength)
      );

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.CATEGORIES, 0, -1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledWith(
              REDIS_KEYS.CATEGORIES,
              CategoryDummyData.createMockCategoryJsonList(categoryLength)
            );
            expect(response.body).toEqual(categoryListExpected);
            done();
          });
      });
    });

    test('get all category failed with categories are empty', (done) => {
      globalThis.prismaClient.category.findMany.mockResolvedValue([]);
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.CATEGORIES, 0, -1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(response.body).toEqual([]);
            done();
          });
      });
    });

    test('get all category failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('get all category failed session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('get all category failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send({})
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(CATEGORY.LOAD_CATEGORIES_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('get all category failed with undefine request body field', (done) => {
      // search is undefine field
      const undefineField = 'search';
      const badRequestBody = { ...requestBody, [undefineField]: '' };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(badRequestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(CATEGORY.LOAD_CATEGORIES_FAIL),
              errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
            });
            done();
          });
      });
    });

    test('get all category failed with output validate error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue(
        CategoryDummyData.createMockCategoryJsonList(categoryLength)
      );

      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.CATEGORIES, 0, -1);
            expect(globalThis.prismaClient.category.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('get all category failed with lRange got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.CATEGORIES, 0, -1);
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('get all category failed with findMany method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      globalThis.prismaClient.category.findMany.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.CATEGORIES, 0, -1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('get all category failed with rPush method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      RedisClient.Instance.Client.rPush.mockRejectedValue(ServerError);
      globalThis.prismaClient.category.findMany.mockResolvedValue(
        CategoryDummyData.createMockCategoryList(categoryLength)
      );
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(getAllCategory)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.lRange).toHaveBeenCalledWith(REDIS_KEYS.CATEGORIES, 0, -1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.rPush).toHaveBeenCalledWith(
              REDIS_KEYS.CATEGORIES,
              CategoryDummyData.createMockCategoryJsonList(categoryLength)
            );
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
