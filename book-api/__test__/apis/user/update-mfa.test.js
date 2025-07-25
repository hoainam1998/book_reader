const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, PATH, METHOD, POWER, POWER_NUMERIC } = require('#constants');
const { USER, COMMON } = require('#messages');
const {
  mockUser,
  authenticationToken,
  sessionData,
  destroySession,
  signedTestCookie,
} = require('#test/resources/auth');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const updateMfaUrl = UserRoutePath.updateMfa.abs;

const requestBody = {
  userId: Date.now().toString(),
  mfaEnable: mockUser.mfa_enable,
};

const mockUserWithRoleUser = {
  ...mockUser,
  power: POWER_NUMERIC.USER,
};

const mockUserWithAdminRole = {
  ...mockUser,
  power: POWER_NUMERIC.ADMIN,
};

const mockUserWithSuperAdminRole = {
  ...mockUser,
  power: POWER_NUMERIC.SUPER_ADMIN,
};

const sessionDataWithUserRole = {
  ...sessionData.user,
  role: POWER.USER,
};

const sessionDataWithSuperAdminRole = {
  ...sessionData.user,
  role: POWER.SUPER_ADMIN,
};

describe('update mfa', () => {
  commonTest(
    'update mfa api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.USER}/unknown`,
        method: METHOD.PUT.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: updateMfaUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'update mfa api cors',
        url: updateMfaUrl,
        method: METHOD.PUT.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'update mfa common test'
  );

  describe(createDescribeTest(METHOD.PUT, updateMfaUrl), () => {
    test.each([
      {
        describe: 'admin role',
        sessionData: sessionData.user,
      },
      {
        describe: 'super admin role',
        sessionData: sessionDataWithSuperAdminRole,
      },
    ])('update mfa will be success with $describe', ({ sessionData }, done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithRoleUser);
      globalThis.prismaClient.user.update.mockResolvedValue(mockUserWithRoleUser);

      expect.hasAssertions();
      signedTestCookie(sessionData).then((responseSign) => {
        const cookie = responseSign.header['set-cookie'];
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', cookie)
          .send(requestBody)
          .expect(HTTP_CODE.CREATED)
          .expect('Content-Type', /application\/json/)
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
                mfa_enable: requestBody.mfaEnable,
              },
            });
            expect(response.body).toEqual({
              message: USER.UPDATE_MFA_STATE_SUCCESS.format(mockUser.email),
            });
            done();
          });
      });
    });

    test('update mfa success with super admin - admin role', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithAdminRole);
      globalThis.prismaClient.user.update.mockResolvedValue(mockUserWithAdminRole);

      expect.hasAssertions();
      signedTestCookie(sessionDataWithSuperAdminRole).then((responseSign) => {
        const cookie = responseSign.header['set-cookie'];
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', cookie)
          .send(requestBody)
          .expect(HTTP_CODE.CREATED)
          .expect('Content-Type', /application\/json/)
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
                mfa_enable: requestBody.mfaEnable,
              },
            });
            expect(response.body).toEqual({
              message: USER.UPDATE_MFA_STATE_SUCCESS.format(mockUser.email),
            });
            done();
          });
      });
    });

    test('update mfa failed with user role', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithRoleUser);
      globalThis.prismaClient.user.update.mockResolvedValue(mockUserWithRoleUser);

      expect.hasAssertions();
      signedTestCookie(sessionDataWithUserRole).then((responseSign) => {
        const cookie = responseSign.header['set-cookie'];
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', cookie)
          .send(requestBody)
          .expect(HTTP_CODE.NOT_PERMISSION)
          .expect('Content-Type', /application\/json/)
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

    test.each([
      {
        describe: 'admin - admin role',
        user: mockUserWithAdminRole,
      },
      {
        describe: 'admin - super admin role',
        user: mockUserWithSuperAdminRole,
      },
    ])('update mfa failed with $describe', ({ user }, done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(user);

      expect.hasAssertions();
      signedTestCookie(sessionDataWithUserRole).then((responseSign) => {
        const cookie = responseSign.header['set-cookie'];
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', cookie)
          .send(requestBody)
          .expect(HTTP_CODE.NOT_PERMISSION)
          .expect('Content-Type', /application\/json/)
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

    test('update mfa failed with authentication token unset', (done) => {
      expect.hasAssertions();

      signedTestCookie(sessionData.user).then((responseSign) => {
        const cookie = responseSign.header['set-cookie'];
        globalThis.api
          .put(updateMfaUrl)
          .send(requestBody)
          .set('Cookie', cookie)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
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

    test('update mfa failed with session expired', (done) => {
      expect.hasAssertions();

      destroySession().then(() => {
        globalThis.api
          .put(updateMfaUrl)
          .send(requestBody)
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
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

    test('update mfa failed with request body empty', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .send({})
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.UPDATE_MFA_STATE_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('update mfa failed with request body was missed field', (done) => {
      // missing userId field.
      const badRequestBody = {
        mfaEnable: requestBody.mfaEnable,
      };

      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .send(badRequestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.UPDATE_MFA_STATE_FAIL),
              errors: expect.arrayContaining([expect.any(String)]),
            });
            done();
          });
      });
    });

    test('update mfa failed with undefine request body field', (done) => {
      const undefineField = 'userIds';
      const badRequestBody = {
        ...requestBody,
        [undefineField]: [Date.now().toString()],
      };

      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .send(badRequestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.UPDATE_MFA_STATE_FAIL),
              errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
            });
            done();
          });
      });
    });

    test('update mfa failed user updated is yourself', (done) => {
      const badRequestBody = {
        ...requestBody,
        userId: sessionData.user.userId,
      };

      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .send(badRequestBody)
          .expect(HTTP_CODE.NOT_PERMISSION)
          .expect('Content-Type', /application\/json/)
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

    test('update mfa failed with output validated error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithRoleUser);
      globalThis.prismaClient.user.update.mockResolvedValue(mockUserWithRoleUser);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .send(requestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
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
                mfa_enable: requestBody.mfaEnable,
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
        describe: 'user not found',
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
    ])('update mfa failed with findUniqueOrThrow $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockRejectedValue(cause);
      globalThis.prismaClient.user.update.mockResolvedValue(mockUserWithRoleUser);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .send(requestBody)
          .expect(status)
          .expect('Content-Type', /application\/json/)
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

    test.each([
      {
        describe: 'user not found',
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
    ])('update mfa failed with findUniqueOrThrow $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithRoleUser);
      globalThis.prismaClient.user.update.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(updateMfaUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .send(requestBody)
          .expect(status)
          .expect('Content-Type', /application\/json/)
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
                mfa_enable: requestBody.mfaEnable,
              },
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
