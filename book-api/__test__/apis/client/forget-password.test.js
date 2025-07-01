const jwt = require('jsonwebtoken');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const EmailService = require('#services/email');
const { HTTP_CODE, METHOD, PATH, RESET_PASSWORD_URL, REGEX } = require('#constants');
const { READER, COMMON } = require('#messages');
const { signClientResetPasswordToken } = require('#utils');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const forgetPasswordUrl = `${PATH.CLIENT}/forget-password`;
const generatedResetPasswordUrl = `${PATH.CLIENT}/generated-reset-password-token`;
const clientMock = ClientDummyData.MockData;

const forgetPasswordResponse = {
  resetPasswordToken: ClientDummyData.resetPasswordToken,
  password: ClientDummyData.password,
  message: READER.SEND_RESET_PASSWORD_SUCCESS,
};

const requestBody = {
  email: clientMock.email,
};

describe('forget-password', () => {
  commonTest('forget password api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: forgetPasswordUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'forget password api cors',
      url: forgetPasswordUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.CLIENT_ORIGIN_CORS,
    }
  ], 'forget password common test');

  describe(createDescribeTest(METHOD.POST, forgetPasswordUrl), () => {
    test('forget password success', (done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(forgetPasswordResponse)));
      const sendEmail = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.OK)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(generatedResetPasswordUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(sendEmail).toHaveBeenCalledTimes(1);
          expect(sendEmail).toHaveBeenCalledWith(
            requestBody.email,
            RESET_PASSWORD_URL.format(forgetPasswordResponse.resetPasswordToken),
            forgetPasswordResponse.password,
          );
          expect(response.body).toEqual({
            message: forgetPasswordResponse.message,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'not found',
        expected: {
          message: READER.EMAIL_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      }
    ])('forget password failed with $describe', ({ cause, expected, status }, done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));
      const sendEmail = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(generatedResetPasswordUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(sendEmail).not.toHaveBeenCalled();
          expect(response.body).toEqual(expected);
          done();
      });
    })
  });

  commonTest('generate reset password token api common test', [
    {
      name: 'cors test',
      describe: 'generate reset password token api cors',
      url: generatedResetPasswordUrl,
      method: METHOD.POST.toLowerCase(),
    }
  ], 'generate reset password token');

  describe(createDescribeTest(METHOD.POST, generatedResetPasswordUrl), () => {
    test('generate reset password token success', (done) => {
      const resetPasswordToken = signClientResetPasswordToken(clientMock.email);
      globalThis.prismaClient.reader.update.mockResolvedValue({
        ...clientMock,
        reset_password_token: resetPasswordToken,
      });

      expect.hasAssertions();
      globalThis.api
        .post(generatedResetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.OK)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
            where: {
              email: requestBody.email,
            },
            data: {
              reset_password_token: resetPasswordToken,
              password: expect.stringMatching(REGEX.PASSWORD),
            }
          });
          expect(response.body).toEqual({
            message: READER.SEND_RESET_PASSWORD_SUCCESS,
            password: expect.stringMatching(REGEX.PASSWORD),
            resetPasswordToken: resetPasswordToken,
          });
          done();
      });
    });

    test('generate reset password token failed with request body is empty', (done) => {
      expect.hasAssertions();
      globalThis.api
        .post(generatedResetPasswordUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(READER.GENERATE_RESET_PASSWORD_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
          });
          done();
        });
    });

    test('generate reset password token failed with undefine request body field', (done) => {
      const undefineField = 'resetToken';
      const badRequestBody = {
        ...requestBody,
        [undefineField]: ''
      };

      expect.hasAssertions();
      globalThis.api
        .post(generatedResetPasswordUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(READER.GENERATE_RESET_PASSWORD_FAIL),
            errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
          });
          done();
        });
    });

    test.each([
      {
        describe: 'client not found',
        cause: PrismaNotFoundError,
        expected: {
          message: READER.EMAIL_NOT_FOUND
        },
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR,
      }
    ])('generate reset password token failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.reader.update.mockRejectedValue(cause);

      expect.hasAssertions();
      globalThis.api
        .post(generatedResetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
            where: {
              email: requestBody.email,
            },
            data: {
              reset_password_token: expect.any(String),
              password: expect.stringMatching(REGEX.PASSWORD),
            }
          });
          expect(response.body).toEqual(expected);
          done();
      });
    });

    test('generate reset password token failed with output validate error', (done) => {
      const mockResultSignResetPasswordToken = signClientResetPasswordToken(clientMock.email);
      const signResult = jest.spyOn(jwt, 'sign').mockImplementation(() => mockResultSignResetPasswordToken);
      globalThis.prismaClient.reader.update.mockResolvedValue({
        ...clientMock,
        reset_password_token: mockResultSignResetPasswordToken,
      });
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      globalThis.api
        .post(generatedResetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          const resetPasswordToken = signResult.mock.results[0].value;
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
            where: {
              email: requestBody.email,
            },
            data: {
              reset_password_token: resetPasswordToken,
              password: expect.stringMatching(REGEX.PASSWORD),
            }
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
      });
    });
  });
});
