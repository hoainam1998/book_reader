const { PrismaNotFoundError, PrismaDuplicateError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, PATH, METHOD, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const {
  mockUser,
  authenticationToken,
  sessionData,
  signedTestCookie,
  destroySession,
} = require('#test/resources/auth');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const updatePersonUrl = UserRoutePath.updatePerson.abs;

const sessionDataWithSuperAdminRole = {
  ...sessionData.user,
  role: POWER.SUPER_ADMIN,
};

describe(createDescribeTest(METHOD.POST, updatePersonUrl), () => {
  commonTest(
    'update person common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.USER}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: updatePersonUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'update person api cors',
        url: updatePersonUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'update person common test'
  );

  test('update person will be success without mfa field', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.prismaClient.user.update.mockResolvedValue();
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                user_id: mockUser.user_id,
              }),
              data: expect.objectContaining({
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                email: mockUser.email,
                sex: mockUser.sex,
                phone: mockUser.phone,
                avatar: expect.any(String),
              }),
            })
          );
          expect(response.body).toEqual({
            message: USER.UPDATE_SELF_INFORMATION_SUCCESS,
          });
          done();
        });
    });
  });

  test('update person will be success with mfa field and super admin field', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionDataWithSuperAdminRole).then((responseSign) => {
      globalThis.prismaClient.user.update.mockResolvedValue();
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .field('mfa', mockUser.mfa_enable)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
            where: {
              user_id: mockUser.user_id,
            },
            data: {
              first_name: mockUser.first_name,
              last_name: mockUser.last_name,
              email: mockUser.email,
              sex: mockUser.sex,
              phone: mockUser.phone,
              avatar: expect.any(String),
              mfa_enable: mockUser.mfa_enable,
            },
          });
          expect(response.body).toEqual({
            message: USER.UPDATE_SELF_INFORMATION_SUCCESS,
          });
          done();
        });
    });
  });

  test('update person failed with mfa field and not super admin field', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseApiSignin) => {
      globalThis.prismaClient.user.update.mockResolvedValue();
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseApiSignin.header['set-cookie'])
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .field('mfa', mockUser.mfa_enable)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.UPDATE_USER_FAIL),
            errors: [USER.ONLY_ALLOW_MFA_WITH_SUPER_ADMIN],
          });
          done();
        });
    });
  });

  test('update person failed with authentication token unset', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updatePersonUrl)
        .set('Cookie', [responseSign.header['set-cookie']])
        .set('Connection', 'keep-alive')
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.USER_UNAUTHORIZED,
            errorCode: ErrorCode.HAVE_NOT_LOGIN,
          });
          done();
        });
    });
  });

  test('update person failed with session expired', (done) => {
    expect.hasAssertions();
    destroySession().then(() => {
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Connection', 'keep-alive')
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.WORKING_SESSION_EXPIRE,
            errorCode: ErrorCode.WORKING_SESSION_ENDED,
          });
          done();
        });
    });
  });

  test('update person failed with bad request', (done) => {
    // missing email field
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.UPDATE_USER_FAIL),
            errors: expect.arrayContaining([expect.any(String)]),
          });
          done();
        });
    });
  });

  test.each([
    {
      describe: 'user not found error',
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
  ])('update person failed with $describe', ({ cause, expected, status }, done) => {
    expect.hasAssertions();
    globalThis.prismaClient.user.update.mockRejectedValue(cause);

    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                user_id: mockUser.user_id,
              }),
              data: expect.objectContaining({
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                email: mockUser.email,
                sex: mockUser.sex,
                phone: mockUser.phone,
                avatar: expect.any(String),
              }),
            })
          );
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });

  test('update person failed with avatar not be image', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .set('Connection', 'keep-alive')
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.FILE_NOT_IMAGE,
          });
          done();
        });
    });
  });

  test('update person failed with avatar is empty file', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .set('Connection', 'keep-alive')
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/images/empty.png'), { contentType: 'image/png' })
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

  test('update person failed with output validate error', (done) => {
    expect.hasAssertions();
    globalThis.prismaClient.user.update.mockResolvedValue();
    jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updatePersonUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .set('Connection', 'keep-alive')
        .field('firstName', mockUser.first_name)
        .field('lastName', mockUser.last_name)
        .field('email', mockUser.email)
        .field('sex', mockUser.sex)
        .field('phone', mockUser.phone)
        .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                user_id: mockUser.user_id,
              }),
              data: expect.objectContaining({
                first_name: mockUser.first_name,
                last_name: mockUser.last_name,
                email: mockUser.email,
                sex: mockUser.sex,
                phone: mockUser.phone,
                avatar: expect.any(String),
              }),
            })
          );
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });
  });
});
