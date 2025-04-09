const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const prismaClientMock = require('#test/mocks/prisma-client');
const app = require('#app');
const prismaClient = require('#services/prisma-client');
const { HTTP_CODE, PATH } = require('#constants');
const { autoGeneratePassword, passwordHashing, signingResetPasswordToken } = require('#utils');
const { COMMON, USER } = require('#messages');
const { urlNotFound, methodNotAllowed } = require('#test/apis/common/common');
const { resetPasswordToken, mockUser } = require('#test/resources/auth');
const resetPasswordUrl = `${PATH.USER}/reset-password`;
const api = request(app);

describe('reset password api test', () => {

  afterEach(() => {
    prismaClientMock.resetAllMocks();
    jest.restoreAllMocks();
  });

  urlNotFound('url is invalid', api.post(`${PATH.USER}/unknown`));
  methodNotAllowed('method not allowed', api.get(resetPasswordUrl));

  test('reset password success', async () => {
    const oldPassword = autoGeneratePassword();

    prismaClient.user.findFirstOrThrow.mockResolvedValue({
      password: await passwordHashing(oldPassword),
    });

    prismaClient.user.update.mockResolvedValue({ reset_password_token: null });

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken,
        email: mockUser.email,
        oldPassword,
        password: mockUser.password,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.OK);
    expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaClient.user.update).toHaveBeenCalledTimes(1);
    expect(response.body).toMatchObject({
      message: USER.RESET_PASSWORD_SUCCESS
    });
  });

  test('old password is same with new password', async () => {
    const oldPassword = autoGeneratePassword();

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken,
        email: mockUser.email,
        oldPassword,
        password: oldPassword,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({
      message: USER.OLD_AND_NEW_PASSWORD_IS_SAME
    });
  });

  test('failed with bad request', async () => {
    const oldPassword = autoGeneratePassword();

    const response = await api.post(resetPasswordUrl)
      .send({
        email: mockUser.email,
        oldPassword,
        password: oldPassword,
      });
    const message = `${USER.RESET_PASSWORD_FAIL}\n${COMMON.INPUT_VALIDATE_FAIL}`;
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
    expect(prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(Object.keys(response.body)).toHaveLength(2);
    expect(response.body.message).toBe(message);
    expect(response.body.errors).toHaveLength(1);
  });

  test('failed with email not register', async () => {
    const oldPassword = autoGeneratePassword();

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken: signingResetPasswordToken('namdang201998@gmail.com'),
        email: mockUser.email,
        oldPassword,
        password: mockUser.password,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({
      message: COMMON.REGISTER_EMAIL_NOT_MATCH
    });
  });

  test('failed with user not found', async () => {
    prismaClient.user.findFirstOrThrow.mockRejectedValue(new PrismaClientKnownRequestError('User not found', { code: 'P2025' }));
    const oldPassword = autoGeneratePassword();

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken,
        email: mockUser.email,
        oldPassword,
        password: mockUser.password,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({
      message: USER.USER_NOT_FOUND
    });
  });

  test('failed with invalid payload token', async () => {
    const oldPassword = autoGeneratePassword();
    const verifyMock = jest.spyOn(jwt, 'verify').mockReturnValue(undefined);

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken,
        email: mockUser.email,
        oldPassword,
        password: mockUser.password,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(verifyMock).toHaveBeenCalled();
    expect(prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({
      message: USER.USER_NOT_FOUND
    });
  });

  test('failed with token has expired', async () => {
    const oldPassword = autoGeneratePassword();
    const verifyMock = jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken,
        email: mockUser.email,
        oldPassword,
        password: mockUser.password,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(verifyMock).toHaveBeenCalled();
    expect(prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({
      message: COMMON.RESET_PASSWORD_TOKEN_EXPIRE
    });
  });

  test('failed with invalid token', async () => {
    const oldPassword = autoGeneratePassword();
    const verifyMock = jest.spyOn(jwt, 'verify').mockImplementationOnce(() =>  {
      throw new Error('jwt malformed');
    });

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken,
        email: mockUser.email,
        oldPassword,
        password: mockUser.password,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
    expect(verifyMock).toHaveBeenCalled();
    expect(prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({
      message: COMMON.TOKEN_INVALID
    });
  });

  test('failed with server error', async () => {
    prismaClient.user.findFirstOrThrow.mockRejectedValue(new Error('Server error!'));
    const oldPassword = autoGeneratePassword();

    const response = await api.post(resetPasswordUrl)
      .send({
        resetPasswordToken,
        email: mockUser.email,
        oldPassword,
        password: mockUser.password,
      });
    expect(response.header['content-type']).toContain('application/json;');
    expect(response.status).toBe(HTTP_CODE.SERVER_ERROR);
    expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalled();
    expect(prismaClient.user.update).not.toHaveBeenCalled();
    expect(response.body).toMatchObject({
      message: COMMON.INTERNAL_ERROR_MESSAGE
    });
  });
});
