const { ServerError } = require('#test/mocks/other-errors');
const ErrorCode = require('#services/error-code');
const CategoryDummyData = require('#test/resources/dummy-data/category');
const OutputValidate = require('#services/output-validate');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { CATEGORY, USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const createCategoryUrl = `${PATH.CATEGORY}/create`;

const mockCategory = CategoryDummyData.MockData;
const mockRequestCategory = CategoryDummyData.MockRequestData;

describe('create category', () => {
  commonTest('create category api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.CATEGORY}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: createCategoryUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'create category api cors',
      url: createCategoryUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'create category common test');

  describe(createDescribeTest(METHOD.POST, createCategoryUrl), () => {
    test('create category will be success', (done) => {
      globalThis.prismaClient.category.create.mockResolvedValue(mockCategory);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockRequestCategory.name)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.CREATED)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.create).toHaveBeenCalledWith({
                data: {
                  category_id: expect.stringMatching(/^(\d){13}$/g),
                  name: mockRequestCategory.name,
                  avatar: expect.any(String),
                }
              });
              expect(response.body).toEqual({
                message: CATEGORY.CREATE_CATEGORY_SUCCESS,
              });
              done();
            });
        });
    });

    test('create category failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .field('name', mockRequestCategory.name)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('create category failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockRequestCategory.name)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('create category failed request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.CREATE_CATEGORY_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY],
              });
              done();
            });
        });
    });

    test('create category failed request body is missing field', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.CREATE_CATEGORY_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('create category failed with undefine request body field', (done) => {
      // categoryIds is undefine field
      const undefineField = 'categoryIds';

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockRequestCategory.name)
            .field(undefineField, Date.now().toString())
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.CREATE_CATEGORY_FAIL),
                errors: expect.arrayContaining([expect.stringContaining(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
              });
              done();
            });
        });
    });

    test('create category failed with avatar do not provide', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockRequestCategory.name)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(CATEGORY.CREATE_CATEGORY_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('create category failed with avatar is empty file', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockRequestCategory.name)
            .attach('avatar', getStaticFile('/images/empty.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.FILE_IS_EMPTY,
              });
              done();
            });
        });
    });

    test('create category failed with avatar is not image file', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockRequestCategory.name)
            .attach('avatar', getStaticFile('/pdf/empty-pdf.pdf'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: COMMON.FILE_NOT_IMAGE,
              });
              done();
            });
        });
    });

    test('create category failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockRequestCategory.name)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.create).toHaveBeenCalledWith({
                data: {
                  category_id: expect.stringMatching(/^(\d){13}$/g),
                  name: mockRequestCategory.name,
                  avatar: expect.any(String),
                }
              });
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL,
              });
              done();
            });
        });
    });

    test('create category failed with server error', (done) => {
      globalThis.prismaClient.category.create.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(createCategoryUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('Connection', 'keep-alive')
            .field('name', mockRequestCategory.name)
            .attach('avatar', getStaticFile('/images/application.png'))
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.SERVER_ERROR)
            .then((response) => {
              expect(globalThis.prismaClient.category.create).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.category.create).toHaveBeenCalledWith({
                data: {
                  category_id: expect.stringMatching(/^(\d){13}$/g),
                  name: mockRequestCategory.name,
                  avatar: expect.any(String),
                }
              });
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });
  })
});
