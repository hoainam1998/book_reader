const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const GraphqlResponse = require('#dto/common/graphql-response');
const EmailService = require('#services/email');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, resetPasswordToken, getResetPasswordLink, randomPassword } = require('#test/resources/auth');
const { autoGeneratePassword } = require('#utils');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const forgetPasswordUrl = UserRoutePath.forgetPassword.abs;
const forgetPasswordInternalUrl = UserRoutePath.forgetPasswordProcess.abs;

const requestBody = {
  email: mockUser.email,
};

const forgetPasswordResponse = {
  password: randomPassword,
  resetPasswordToken: resetPasswordToken,
};

describe('forget password', () => {
  commonTest(
    'forget password api common test',
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
        url: forgetPasswordUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'forget password api cors',
        url: forgetPasswordUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'forget password common test'
  );

  describe(createDescribeTest(METHOD.POST, forgetPasswordUrl), () => {
    afterEach(() => fetch.mockReset());

    test('forget password will be success', (done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(forgetPasswordResponse), { status: HTTP_CODE.OK }));
      const sendPassword = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.OK)
        .then((response) => {
          const link = getResetPasswordLink(forgetPasswordResponse.resetPasswordToken);
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(forgetPasswordUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
              }),
              body: JSON.stringify(requestBody),
            })
          );
          expect(sendPassword).toHaveBeenCalledTimes(1);
          expect(sendPassword).toHaveBeenCalledWith(mockUser.email, link, forgetPasswordResponse.password);
          expect(response.body).toEqual({
            message: USER.UPDATE_PASSWORD,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'user not found',
        expected: {
          message: USER.USER_NOT_FOUND,
        },
        status: HTTP_CODE.UNAUTHORIZED,
      },
      {
        describe: 'bad request',
        expected: {
          message: getInputValidateMessage(USER.RESET_PASSWORD_FAIL),
          errors: [],
        },
        status: HTTP_CODE.BAD_REQUEST,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
    ])('forget password failed with $describe', ({ expected, status }, done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));

      const sendPassword = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(forgetPasswordUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
              }),
              body: JSON.stringify(requestBody),
            })
          );
          expect(sendPassword).not.toHaveBeenCalled();
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });

  commonTest(
    'forget password internal api common test',
    [
      {
        name: 'cors test',
        describe: 'forget password internal api cors',
        url: forgetPasswordInternalUrl,
        method: METHOD.POST.toLowerCase(),
      },
    ],
    'forget password internal'
  );

  describe(createDescribeTest(METHOD.POST, forgetPasswordInternalUrl), () => {
    test('forget password internal will be success', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue({ ...mockUser, password: randomPassword });

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordInternalUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.OK)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                email: mockUser.email,
              }),
              data: expect.objectContaining({
                reset_password_token: expect.any(String),
                password: expect.any(String),
              }),
            })
          );
          expect(response.body).toEqual({
            resetPasswordToken: mockUser.reset_password_token,
            password: expect.stringMatching(/(.+){8}/g),
          });
          done();
        });
    });

    test('forget password internal failed with bad request', (done) => {
      const badRequestBody = {
        email: 'unknownEmail',
      };

      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordInternalUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.RESET_PASSWORD_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
        });
    });

    test('forget password internal failed with output validate error', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue({ ...mockUser, password: randomPassword });

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(() =>
        GraphqlResponse.dto.parse({
          data: {
            password: autoGeneratePassword(),
            resetPasswordToken: mockUser.reset_password_token,
          },
        })
      );

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordInternalUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                email: mockUser.email,
              }),
              data: expect.objectContaining({
                reset_password_token: expect.any(String),
                password: expect.any(String),
              }),
            })
          );
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'user not found',
        cause: PrismaNotFoundError,
        expected: {
          message: USER.USER_NOT_FOUND,
        },
        status: HTTP_CODE.UNAUTHORIZED,
      },
      {
        describe: 'server error',
        cause: new Error('Server error!'),
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
    ])('forget password internal failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.user.update.mockRejectedValue(cause);

      expect.hasAssertions();
      globalThis.api
        .post(forgetPasswordInternalUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                email: mockUser.email,
              }),
              data: expect.objectContaining({
                reset_password_token: expect.any(String),
                password: expect.any(String),
              }),
            })
          );
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });
});
