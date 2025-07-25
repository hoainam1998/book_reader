const { PrismaNotFoundError, PrismaDuplicateError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const ClientRoutePath = require('#services/route-paths/client');
const ClientDummyData = require('#test/resources/dummy-data/client');
const { HTTP_CODE, PATH, METHOD } = require('#constants');
const { USER, COMMON, READER } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const updateClientUrl = ClientRoutePath.updatePerson.abs;
const mockClient = ClientDummyData.MockData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;

describe(createDescribeTest(METHOD.POST, updateClientUrl), () => {
  commonTest(
    'update client common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.CLIENT}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: updateClientUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'update client api cors',
        url: updateClientUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'update client common test'
  );

  test('update client will be success', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.prismaClient.reader.update.mockResolvedValue();
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
            where: {
              reader_id: mockClient.reader_id,
            },
            data: {
              first_name: mockClient.first_name,
              last_name: mockClient.last_name,
              email: mockClient.email,
              sex: mockClient.sex,
              phone: mockClient.phone,
              avatar: expect.any(String),
            },
          });
          expect(response.body).toEqual({
            message: READER.ADD_PERSONAL_INFORMATION_SUCCESS,
          });
          done();
        });
    });
  });

  test('update client failed with authentication token unset', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.api
        .put(updateClientUrl)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .set('Connection', 'keep-alive')
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.USER_UNAUTHORIZED,
            errorCode: ErrorCode.HAVE_NOT_LOGIN,
          });
          done();
        });
    });
  });

  test('update client failed with session expired', (done) => {
    expect.hasAssertions();
    destroySession().then(() => {
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Connection', 'keep-alive')
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.WORKING_SESSION_EXPIRE,
            errorCode: ErrorCode.WORKING_SESSION_ENDED,
          });
          done();
        });
    });
  });

  test('update client failed with bad request', (done) => {
    // missing email field
    expect.hasAssertions();
    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(READER.ADD_PERSONAL_INFORMATION_FAIL),
            errors: expect.arrayContaining([expect.any(String)]),
          });
          done();
        });
    });
  });

  test.each([
    {
      describe: 'client not found error',
      cause: PrismaNotFoundError,
      expected: {
        message: USER.USER_NOT_FOUND,
      },
      status: HTTP_CODE.NOT_FOUND,
    },
    {
      describe: 'email or phone have already exist',
      cause: PrismaDuplicateError,
      expected: {
        message: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
      },
      status: HTTP_CODE.BAD_REQUEST,
    },
    {
      describe: 'server error',
      cause: ServerError,
      expected: {
        message: COMMON.INTERNAL_ERROR_MESSAGE,
      },
      status: HTTP_CODE.SERVER_ERROR,
    },
  ])('update client failed with $describe', ({ cause, expected, status }, done) => {
    expect.hasAssertions();
    globalThis.prismaClient.reader.update.mockRejectedValue(cause);
    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
            where: {
              reader_id: mockClient.reader_id,
            },
            data: {
              first_name: mockClient.first_name,
              last_name: mockClient.last_name,
              email: mockClient.email,
              sex: mockClient.sex,
              phone: mockClient.phone,
              avatar: expect.any(String),
            },
          });
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });

  test('update client failed with avatar not be image', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .set('Connection', 'keep-alive')
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/pdf/pdf-test.pdf'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_IMAGE,
          });
          done();
        });
    });
  });

  test('update client failed with avatar is empty file', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .set('Connection', 'keep-alive')
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/empty.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_IS_EMPTY,
          });
          done();
        });
    });
  });

  test('update client failed with output validate error', (done) => {
    expect.hasAssertions();
    globalThis.prismaClient.reader.update.mockResolvedValue();
    jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .set('Connection', 'keep-alive')
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', mockClient.sex)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
            where: {
              reader_id: mockClient.reader_id,
            },
            data: {
              first_name: mockClient.first_name,
              last_name: mockClient.last_name,
              email: mockClient.email,
              sex: mockClient.sex,
              phone: mockClient.phone,
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

  test('update client failed with invalid gender', (done) => {
    expect.hasAssertions();
    const invalidGender = 2;

    signedTestCookie(sessionData, 'client').then((responseApiSignin) => {
      globalThis.api
        .put(updateClientUrl)
        .set('authorization', apiKey)
        .set('Cookie', [responseApiSignin.header['set-cookie']])
        .set('Connection', 'keep-alive')
        .field('firstName', mockClient.first_name)
        .field('lastName', mockClient.last_name)
        .field('email', mockClient.email)
        .field('sex', invalidGender)
        .field('phone', mockClient.phone)
        .attach('avatar', getStaticFile('/images/application.png'))
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(READER.ADD_PERSONAL_INFORMATION_FAIL),
            errors: expect.arrayContaining([expect.any(String)]),
          });
          done();
        });
    });
  });
});
