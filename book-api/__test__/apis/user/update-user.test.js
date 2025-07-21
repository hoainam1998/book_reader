const { PrismaNotFoundError, PrismaDuplicateError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD, PATH, POWER, POWER_NUMERIC } = require('#constants');
const { USER, COMMON } = require('#messages');
const {
  mockUser,
  authenticationToken,
  sessionData,
  signedTestCookie,
  destroySession,
} = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const updateUserUrl = UserRoutePath.updateUser.abs;

const requestBody = {
  userId: mockUser.user_id,
  firstName: mockUser.first_name,
  lastName: mockUser.last_name,
  email: mockUser.email,
  sex: mockUser.sex,
  phone: mockUser.phone,
  mfa: true,
  power: POWER_NUMERIC.USER,
};

const mockUserWithUserRole = {
  ...mockUser,
  power: POWER_NUMERIC.USER,
};

const sessionDataWithUserRole = {
  ...sessionData.user,
  role: POWER.USER,
};

const sessionDataWithSuperAdminRole = {
  ...sessionData.user,
  role: POWER.SUPER_ADMIN,
};

describe(createDescribeTest(METHOD.POST, updateUserUrl), () => {
  commonTest(
    'update user common test',
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
        url: updateUserUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'update user api cors',
        url: updateUserUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'update user common test'
  );

  test('update user will be success admin - user role', (done) => {
    globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
    globalThis.prismaClient.user.update.mockResolvedValue();
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            select: {
              power: true,
            },
          });
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              sex: requestBody.sex,
              phone: requestBody.phone,
              mfa_enable: requestBody.mfa,
              power: requestBody.power,
            },
          });
          expect(response.body).toEqual({
            message: USER.UPDATE_USER_SUCCESS,
          });
          done();
        });
    });
  });

  test('update user will be success super admin - user role', (done) => {
    globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
    globalThis.prismaClient.user.update.mockResolvedValue();
    expect.hasAssertions();
    signedTestCookie(sessionDataWithSuperAdminRole).then((responseSign) => {
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            select: {
              power: true,
            },
          });
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              sex: requestBody.sex,
              phone: requestBody.phone,
              mfa_enable: requestBody.mfa,
              power: requestBody.power,
            },
          });
          expect(response.body).toEqual({
            message: USER.UPDATE_USER_SUCCESS,
          });
          done();
        });
    });
  });

  test('update user failed with authentication token unset', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updateUserUrl)
        .set('Cookie', [responseSign.header['set-cookie']])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.USER_UNAUTHORIZED,
            errorCode: ErrorCode.HAVE_NOT_LOGIN,
          });
          done();
        });
    });
  });

  test('update user failed with session expired error', (done) => {
    expect.hasAssertions();
    destroySession().then(() => {
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.WORKING_SESSION_EXPIRE,
            errorCode: ErrorCode.WORKING_SESSION_ENDED,
          });
          done();
        });
    });
  });

  test('update user failed with wrong permission error', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionDataWithUserRole).then((responseApiSignin) => {
      const sessionToken = responseApiSignin.header['set-cookie'];
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', [sessionToken])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.NOT_PERMISSION)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.NOT_PERMISSION,
          });
          done();
        });
    });
  });

  test('update user failed with admin - admin role', (done) => {
    globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUser);
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseApiSignin) => {
      const sessionToken = responseApiSignin.header['set-cookie'];
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', [sessionToken])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.NOT_PERMISSION)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            select: {
              power: true,
            },
          });
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.NOT_PERMISSION,
          });
          done();
        });
    });
  });

  test('update user failed undefine request body field', (done) => {
    const undefineField = 'userIds';
    const badRequestBody = {
      ...requestBody,
      [undefineField]: [Date.now().toString()],
    };
    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseApiSignin) => {
      const sessionToken = responseApiSignin.header['set-cookie'];
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', [sessionToken])
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.UPDATE_USER_FAIL),
            errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
          });
          done();
        });
    });
  });

  test('update user failed with bad request', (done) => {
    // missing email field.
    const badRequestBody = {
      ...requestBody,
    };
    delete badRequestBody.email;

    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseApiSignin) => {
      const sessionToken = responseApiSignin.header['set-cookie'];
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', [sessionToken])
        .send(badRequestBody)
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
  ])('update user failed with $describe', ({ cause, expected, status }, done) => {
    globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
    globalThis.prismaClient.user.update.mockRejectedValue(cause);

    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            select: {
              power: true,
            },
          });
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              sex: requestBody.sex,
              phone: requestBody.phone,
              mfa_enable: requestBody.mfa,
              power: requestBody.power,
            },
          });
          expect(response.body).toEqual(expected);
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
      describe: 'server error',
      cause: ServerError,
      expected: {
        message: COMMON.INTERNAL_ERROR_MESSAGE,
      },
      status: HTTP_CODE.SERVER_ERROR,
    },
  ])('update user failed with findUniqueOrThrow throw $describe', ({ cause, expected, status }, done) => {
    globalThis.prismaClient.user.findUniqueOrThrow.mockRejectedValue(cause);
    globalThis.prismaClient.user.update.mockRejectedValue(cause);

    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseSign) => {
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', responseSign.header['set-cookie'])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            select: {
              power: true,
            },
          });
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });

  test('update user failed with output validate error', (done) => {
    jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
    globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
    globalThis.prismaClient.user.update.mockResolvedValue(mockUserWithUserRole);

    expect.hasAssertions();
    signedTestCookie(sessionData.user).then((responseApiSignin) => {
      const sessionToken = responseApiSignin.header['set-cookie'];
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', [sessionToken])
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            select: {
              power: true,
            },
          });
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
            where: {
              user_id: requestBody.userId,
            },
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              sex: requestBody.sex,
              phone: requestBody.phone,
              mfa_enable: requestBody.mfa,
              power: requestBody.power,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });
  });
});
