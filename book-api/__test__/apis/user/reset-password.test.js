const jwt = require('jsonwebtoken');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { JsonWebTokenError, TokenExpiredError } = require('#test/mocks/json-web-token-error');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { autoGeneratePassword, passwordHashing, signingResetPasswordToken } = require('#utils');
const { COMMON, USER } = require('#messages');
const { resetPasswordToken, mockUser } = require('#test/resources/auth');
const { createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const resetPasswordUrl = `${PATH.USER}/reset-password`;

describe('reset password', () => {
  commonTest('reset password common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: resetPasswordUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'reset password api cors',
      url: resetPasswordUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS
    }
  ], 'reset password');

  describe(createDescribeTest(METHOD.POST, resetPasswordUrl), () => {
    afterEach((done) => {
      jest.restoreAllMocks();
      done();
    });

    test('reset password success', async () => {
      const oldPassword = autoGeneratePassword();

      globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({
        password: await passwordHashing(oldPassword),
      });

      globalThis.prismaClient.user.update.mockResolvedValue({ reset_password_token: null });

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken,
          email: mockUser.email,
          oldPassword,
          password: mockUser.password,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.OK);
      expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
      expect(response.body).toMatchObject({
        message: USER.RESET_PASSWORD_SUCCESS
      });
    });

    test('old password is same with new password', async () => {
      const oldPassword = autoGeneratePassword();

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken,
          email: mockUser.email,
          oldPassword,
          password: oldPassword,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(response.body).toMatchObject({
        message: USER.OLD_AND_NEW_PASSWORD_IS_SAME
      });
    });

    test('failed with bad request', async () => {
      const oldPassword = autoGeneratePassword();

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          email: mockUser.email,
          oldPassword,
          password: oldPassword,
        });
      const message = `${USER.RESET_PASSWORD_FAIL}\n${COMMON.INPUT_VALIDATE_FAIL}`;
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
      expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(Object.keys(response.body)).toHaveLength(2);
      expect(response.body.message).toBe(message);
      expect(response.body.errors).toHaveLength(1);
    });

    test('failed with email not register', async () => {
      const oldPassword = autoGeneratePassword();

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken: signingResetPasswordToken('namdang201998@gmail.com'),
          email: mockUser.email,
          oldPassword,
          password: mockUser.password,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(response.body).toMatchObject({
        message: COMMON.REGISTER_EMAIL_NOT_MATCH
      });
    });

    test('failed with user not found', async () => {
      globalThis.prismaClient.user.findFirstOrThrow.mockRejectedValue(new PrismaClientKnownRequestError('User not found', { code: 'P2025' }));
      const oldPassword = autoGeneratePassword();

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken,
          email: mockUser.email,
          oldPassword,
          password: mockUser.password,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(response.body).toMatchObject({
        message: USER.USER_NOT_FOUND
      });
    });

    test('failed with invalid payload token', async () => {
      const oldPassword = autoGeneratePassword();
      const verifyMock = jest.spyOn(jwt, 'verify').mockReturnValue(undefined);

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken,
          email: mockUser.email,
          oldPassword,
          password: mockUser.password,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(verifyMock).toHaveBeenCalled();
      expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(response.body).toMatchObject({
        message: USER.USER_NOT_FOUND
      });
    });

    test('failed with token has expired', async () => {
      const oldPassword = autoGeneratePassword();
      const verifyMock = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new TokenExpiredError('jwt expired');
      });

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken,
          email: mockUser.email,
          oldPassword,
          password: mockUser.password,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(verifyMock).toHaveBeenCalled();
      expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(response.body).toMatchObject({
        message: COMMON.RESET_PASSWORD_TOKEN_EXPIRE
      });
    });

    test('failed with invalid token', async () => {
      const oldPassword = autoGeneratePassword();
      const verifyMock = jest.spyOn(jwt, 'verify').mockImplementationOnce(() =>  {
        throw new JsonWebTokenError('jwt malformed');
      });

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken,
          email: mockUser.email,
          oldPassword,
          password: mockUser.password,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(verifyMock).toHaveBeenCalled();
      expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(response.body).toMatchObject({
        message: COMMON.TOKEN_INVALID
      });
    });

    test('failed with server error', async () => {
      globalThis.prismaClient.user.findFirstOrThrow.mockRejectedValue(new Error('Server error!'));
      const oldPassword = autoGeneratePassword();

      const response = await globalThis.api.post(resetPasswordUrl)
        .send({
          resetPasswordToken,
          email: mockUser.email,
          oldPassword,
          password: mockUser.password,
        });
      expect(response.header['content-type']).toContain('application/json;');
      expect(response.status).toBe(HTTP_CODE.SERVER_ERROR);
      expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalled();
      expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
      expect(response.body).toMatchObject({
        message: COMMON.INTERNAL_ERROR_MESSAGE
      });
    });
  });
});
