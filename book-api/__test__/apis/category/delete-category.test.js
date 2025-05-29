const { ServerError } = require('#test/mocks/other-errors');
const { PrismaForeignConflict, PrismaNotFoundError } = require('#test/mocks/prisma-error');
const CategoryDummyData = require('#test/resources/dummy-data/category');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, CATEGORY, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const mockCategory = CategoryDummyData.MockData;
const mockRequestCategory = CategoryDummyData.MockRequestData;
const deleteCategoryUrl = `${PATH.CATEGORY}/delete/${mockRequestCategory.category_id}`;

describe('delete category', () => {
  commonTest('delete category api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.CATEGORY}/unknown`,
      method: METHOD.DELETE.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: deleteCategoryUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'delete category api cors',
      url: deleteCategoryUrl,
      method: METHOD.DELETE.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'delete category common test');

  describe(createDescribeTest(METHOD.POST, deleteCategoryUrl), () => {
    test('delete category success', (done) => {
      globalThis.prismaClient.category.delete.mockResolvedValue(mockCategory);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .delete(deleteCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.category.delete).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.delete).toHaveBeenCalledWith({
                where: {
                  category_id: mockRequestCategory.category_id,
                },
              });
              expect(response.body).toEqual({
                message: CATEGORY.DELETE_CATEGORY_SUCCESS,
              });
              done();
            });
        });
    });

    test('delete category failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .delete(deleteCategoryUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.category.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('delete category failed session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .delete(deleteCategoryUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.category.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('delete category failed with invalid request param', (done) => {
      const newDeleteCategoryUrl = `${PATH.CATEGORY}/delete/unknown`

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .delete(newDeleteCategoryUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.category.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.DELETE_CATEGORY_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('delete category failed with output validate error', (done) => {
      globalThis.prismaClient.category.delete.mockResolvedValue(mockCategory);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .delete(deleteCategoryUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.category.delete).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.delete).toHaveBeenCalledWith({
                where: {
                  category_id: mockRequestCategory.category_id,
                },
              });
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL,
              });
              done();
            });
        });
    });

    test.each([
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
      {
        describe: 'not found',
        cause: PrismaNotFoundError,
        expected: {
          message: CATEGORY.CATEGORY_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'category is already used',
        cause: new PrismaForeignConflict('category_id'),
        expected: {
          message: CATEGORY.CATEGORY_USED,
        },
        status: HTTP_CODE.BAD_REQUEST,
      }
    ])('delete category failed with $describe', ({ cause, expected, status }, done) => {
        globalThis.prismaClient.category.delete.mockRejectedValue(cause);

        expect.hasAssertions();
        signedTestCookie(sessionData.user)
          .then((responseSign) => {
            globalThis.api
              .delete(deleteCategoryUrl)
              .set('Cookie', [responseSign.header['set-cookie']])
              .set('authorization', authenticationToken)
              .expect(status)
              .expect('Content-Type', /application\/json/)
              .then((response) => {
                expect(globalThis.prismaClient.category.delete).toHaveBeenCalledTimes(1);
                expect(globalThis.prismaClient.category.delete).toHaveBeenCalledWith({
                  where: {
                    category_id: mockRequestCategory.category_id,
                  },
                });
                expect(response.body).toEqual(expected);
                done();
              });
          });
    });
  });
});
