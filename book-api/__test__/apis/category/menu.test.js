const { ServerError } = require('#test/mocks/other-errors');
const CategoryDummyData = require('#test/resources/dummy-data/category');
const RedisClient = require('#services/redis-client/redis');
const OutputValidate = require('#services/output-validate');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ErrorCode = require('#services/error-code');
const CategoryRoutePath = require('#services/route-paths/category');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, CATEGORY, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const menu = CategoryRoutePath.menu.abs;
const categoryLength = 2;

const requestBody = {
  query: {
    name: true,
    avatar: true,
    categoryId: true,
  },
};

describe('category menu', () => {
  commonTest(
    'category menu api common test',
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
        url: menu,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'category menu api cors',
        url: menu,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'category menu common test'
  );

  describe(createDescribeTest(METHOD.POST, menu), () => {
    test('category menu success', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const categoryListExpected = CategoryDummyData.generateCategoryExpectedList(requestBody.query, categoryLength);
      globalThis.prismaClient.category.findMany.mockResolvedValue(
        CategoryDummyData.createMockCategoryList(categoryLength)
      );

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              where: {
                book: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual(categoryListExpected);
            done();
          });
      });
    });

    test('category menu failed with categories are empty', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.category.findMany.mockResolvedValue([]);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              where: {
                book: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual([]);
            done();
          });
      });
    });

    test('category menu failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(menu)
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

    test('category menu failed session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(menu)
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

    test('category menu failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(menu)
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

    test('category menu failed with undefine request body field', (done) => {
      // search is undefine field
      const undefineField = 'search';
      const badRequestBody = { ...requestBody, [undefineField]: '' };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(menu)
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

    test('category menu failed with output validate error', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.category.findMany.mockResolvedValue(
        CategoryDummyData.createMockCategoryJsonList(categoryLength)
      );
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              where: {
                book: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('category menu failed with findMany method got server error', (done) => {
      RedisClient.Instance.Client.lRange.mockResolvedValue([]);
      globalThis.prismaClient.category.findMany.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(menu)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.lRange).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.findMany).toHaveBeenCalledWith({
              where: {
                book: {
                  some: {},
                },
              },
              select: selectExpected,
            });
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            expect(RedisClient.Instance.Client.rPush).not.toHaveBeenCalled();
            done();
          });
      });
    });
  });
});
