const jwt = require('jsonwebtoken');
const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { TokenExpiredError, JsonWebTokenError } = require('#test/mocks/json-web-token-error');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const ClientRoutePath = require('#services/route-paths/client');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { READER, USER, COMMON } = require('#messages');
const commonTest = require('#test/apis/common/common');
const { autoGeneratePassword } = require('#utils');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const resetPasswordUrl = ClientRoutePath.resetPassword.abs;
const mockRequestClient = ClientDummyData.MockRequestData;
const clientMock = ClientDummyData.MockData;

const requestBody = {
  resetPasswordToken: ClientDummyData.resetPasswordToken,
  email: mockRequestClient.email,
  oldPassword: ClientDummyData.password,
  password: autoGeneratePassword(),
};

describe('reset password', () => {
  commonTest('reset password api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.CLIENT}/unknown`,
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
      origin: process.env.CLIENT_ORIGIN_CORS,
    }
  ], 'reset password common test');

  describe(createDescribeTest(METHOD.POST, resetPasswordUrl), () => {
    test('reset password will be success', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      globalThis.prismaClient.reader.update.mockResolvedValue(clientMock);

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.OK);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        select: {
          password: true,
        },
      });
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        data: {
          password: requestBody.password,
          reset_password_token: null,
        },
      });
      expect(response.body).toEqual({
        message: READER.RESET_PASSWORD_SUCCESS,
      });
    });

    test('reset password failed new password and old password are same', async () => {
      const badRequestBody = {
        ...requestBody,
        password: requestBody.oldPassword,
      };

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: USER.OLD_AND_NEW_PASSWORD_IS_SAME,
        errorCode: ErrorCode.DATA_IS_DUPLICATE,
      });
    });

    test('reset password failed with email not match', async () => {
      const badRequestBody = {
        ...requestBody,
        email: 'not_match@gmail.com'
      };

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: COMMON.REGISTER_EMAIL_NOT_MATCH,
        errorCode: ErrorCode.CREDENTIAL_NOT_MATCH,
      });
    });

    test('reset password failed token expired error', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw TokenExpiredError;
      });

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: COMMON.RESET_PASSWORD_TOKEN_EXPIRE,
        errorCode: ErrorCode.TOKEN_EXPIRED,
      });
    });

    test('reset password failed jsonwebtoken error', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw JsonWebTokenError;
      });

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: COMMON.TOKEN_INVALID,
        errorCode: ErrorCode.TOKEN_INVALID,
      });
    });

    test('reset password failed request body are empty', (done) => {
      expect.hasAssertions();
      globalThis.api
        .post(resetPasswordUrl)
        .set('Connection', 'keep-alive')
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.RESET_PASSWORD_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
        });
        done();
      });
    });

    test('reset password failed request body is missing field', (done) => {
      // missing email
      const badRequestBody = { ...requestBody };
      delete badRequestBody.email;

      expect.hasAssertions();
      globalThis.api
        .post(resetPasswordUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.RESET_PASSWORD_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
      });
    });

    test('reset password failed with undefine request body field', (done) => {
      // query is undefine field
      const undefineField = 'query';
      const badRequestBody = {
        ...requestBody,
        [undefineField]: {
          message: true,
        }
      };

      expect.hasAssertions();
      globalThis.api
        .post(resetPasswordUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.RESET_PASSWORD_FAIL),
            errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
          });
        done();
      });
    });

    test('reset password failed with output validate error', async () => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      globalThis.prismaClient.reader.update.mockResolvedValue(clientMock);

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        select: {
          password: true,
        },
      });
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        data: {
          password: requestBody.password,
          reset_password_token: null,
        },
      });
      expect(response.body).toEqual({
        message: COMMON.OUTPUT_VALIDATE_FAIL,
      });
    });

    test('reset password failed with findFirstOrThrow method get server error', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockRejectedValue(ServerError);

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        select: {
          password: true,
        },
      });
      expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: COMMON.INTERNAL_ERROR_MESSAGE,
      });
    });

    test('reset password failed with update method get server error', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      globalThis.prismaClient.reader.update.mockRejectedValue(ServerError);

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        select: {
          password: true,
        },
      });
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        data: {
          password: requestBody.password,
          reset_password_token: null,
        },
      });
      expect(response.body).toEqual({
        message: COMMON.INTERNAL_ERROR_MESSAGE,
      });
    });

    test('reset password failed with findFirstOrThrow method get not found error', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockRejectedValue(PrismaNotFoundError);

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        select: {
          password: true,
        },
      });
      expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: READER.USER_NOT_FOUND,
      });
    });

    test('reset password failed with update method get not found error', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      globalThis.prismaClient.reader.update.mockRejectedValue(PrismaNotFoundError);

      expect.hasAssertions();
      const response = await globalThis.api
        .post(resetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        select: {
          password: true,
        },
      });
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
        where: {
          reset_password_token: requestBody.resetPasswordToken,
          email: requestBody.email,
        },
        data: {
          password: requestBody.password,
          reset_password_token: null,
        },
      });
      expect(response.body).toEqual({
        message: READER.USER_NOT_FOUND,
      });
    });
  })
});
