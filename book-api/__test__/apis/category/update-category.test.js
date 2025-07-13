const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const ErrorCode = require('#services/error-code');
const CategoryDummyData = require('#test/resources/dummy-data/category');
const OutputValidate = require('#services/output-validate');
const CategoryRoutePath = require('#services/route-paths/category');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { CATEGORY, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const updateCategoryUrl = CategoryRoutePath.update.abs;
const mockCategory = CategoryDummyData.MockData;
const mockRequestCategory = CategoryDummyData.MockRequestData;

describe('update category', () => {
  commonTest(
    'update category api common test',
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
        url: updateCategoryUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'update category api cors',
        url: updateCategoryUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'update category common test'
  );

  describe(createDescribeTest(METHOD.POST, updateCategoryUrl), () => {
    test('update category will be success', (done) => {
      globalThis.prismaClient.category.update.mockResolvedValue(mockCategory);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.CREATED)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledWith({
              where: {
                category_id: mockRequestCategory.category_id,
              },
              data: {
                name: mockRequestCategory.name,
                avatar: expect.any(String),
              },
            });
            expect(response.body).toEqual({
              message: CATEGORY.UPDATE_CATEGORY_SUCCESS,
            });
            done();
          });
      });
    });

    test('update category failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('update category failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('update category failed request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(CATEGORY.UPDATE_CATEGORY_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('update category failed request body is missing field', (done) => {
      // missing name
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(CATEGORY.UPDATE_CATEGORY_FAIL),
              errors: expect.any(Array),
            });
            expect(response.body.errors).toHaveLength(1);
            done();
          });
      });
    });

    test('update category failed with undefine request body field', (done) => {
      // categoryIds is undefine field
      const undefineField = 'categoryIds';

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .field(undefineField, Date.now().toString())
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(CATEGORY.UPDATE_CATEGORY_FAIL),
              errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
            });
            done();
          });
      });
    });

    test('update category failed with avatar do not provide', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(CATEGORY.UPDATE_CATEGORY_FAIL),
              errors: expect.any(Array),
            });
            expect(response.body.errors).toHaveLength(1);
            done();
          });
      });
    });

    test('update category failed with avatar is empty file', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/images/empty.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.FILE_IS_EMPTY,
            });
            done();
          });
      });
    });

    test('update category failed with avatar is not image file', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/pdf/empty-pdf.pdf'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.FILE_NOT_IMAGE,
            });
            done();
          });
      });
    });

    test('update category failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledWith({
              where: {
                category_id: mockRequestCategory.category_id,
              },
              data: {
                name: mockRequestCategory.name,
                avatar: expect.any(String),
              },
            });
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('update category failed with author not found', (done) => {
      globalThis.prismaClient.category.update.mockRejectedValue(PrismaNotFoundError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.NOT_FOUND)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledWith({
              where: {
                category_id: mockRequestCategory.category_id,
              },
              data: {
                name: mockRequestCategory.name,
                avatar: expect.any(String),
              },
            });
            expect(response.body).toEqual({
              message: CATEGORY.CATEGORY_NOT_FOUND,
            });
            done();
          });
      });
    });

    test('update category failed with server error', (done) => {
      globalThis.prismaClient.category.update.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateCategoryUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('Connection', 'keep-alive')
          .field('categoryId', mockRequestCategory.category_id)
          .field('name', mockRequestCategory.name)
          .attach('avatar', getStaticFile('/images/application.png'))
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.SERVER_ERROR)
          .then((response) => {
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.category.update).toHaveBeenCalledWith({
              where: {
                category_id: mockRequestCategory.category_id,
              },
              data: {
                name: mockRequestCategory.name,
                avatar: expect.any(String),
              },
            });
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
