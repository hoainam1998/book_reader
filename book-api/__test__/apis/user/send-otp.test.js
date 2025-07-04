const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const GraphqlResponse = require('#dto/common/graphql-response');
const EmailService = require('#services/email');
const ErrorCode = require('#services/error-code');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, otpCode, sessionData, signedTestCookie, authenticationToken } = require('#test/resources/auth');
const { generateOtp } = require('#utils');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const sendOtpUrl = UserRoutePath.sendOtp.abs;
const sendOtpInternalUrl = UserRoutePath.updateOtp.abs;

const requestBody = {
  query: {
    message: true,
    otp: true
  },
};

describe('send otp', () => {
  commonTest('send otp api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: sendOtpUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'send otp api cors',
      url: sendOtpUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'send otp common test');

  describe(createDescribeTest(METHOD.POST, sendOtpUrl), () => {
    afterEach((done) => {
      fetch.mockClear();
      done();
    });

    test('send otp will be success', (done) => {
      const sendOtpEmail = jest.spyOn(EmailService, 'sendOtpEmail').mockResolvedValue();

      fetch.mockResolvedValue(new Response(JSON.stringify({
        otp: otpCode,
        message: USER.OTP_HAS_BEEN_SENT
      })));

      expect.hasAssertions();
      signedTestCookie({
        ...sessionData.user,
        apiKey: null,
      }).then((responseSign) => {
        const cookie = responseSign.header['set-cookie'];
        globalThis.api.post(sendOtpUrl)
          .set('Cookie', cookie)
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(
              expect.stringContaining(sendOtpInternalUrl),
              expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'Cookie': cookie,
              }),
              body: JSON.stringify(requestBody)
            }));
            expect(sendOtpEmail).toHaveBeenCalledTimes(1);
            expect(sendOtpEmail).toHaveBeenCalledWith(expect.stringMatching(sessionData.user.email), expect.stringMatching(otpCode));
            expect(response.body).toEqual({
              message: USER.OTP_HAS_BEEN_SENT
            });
            done();
          });
        });
    });

    test('send otp failed with user has not login yet', (done) => {
      const sendOtpEmail = jest.spyOn(EmailService, 'sendOtpEmail').mockResolvedValue();
      fetch.mockResolvedValue();

      expect.hasAssertions();
      globalThis.api.post(sendOtpUrl)
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).not.toHaveBeenCalled();
          expect(sendOtpEmail).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.USER_UNAUTHORIZED,
            errorCode: ErrorCode.HAVE_NOT_LOGIN,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'user was turned off mfa state',
        expected: {
          message: USER.MFA_UNENABLE,
          errorCode: ErrorCode.MFA_TURN_OFF,
        },
        credential: {
          ...sessionData.user,
          mfaEnable: false,
        },
        status: HTTP_CODE.UNAUTHORIZED,
      },
      {
        describe: 'user has already logged',
        expected: {
          message: USER.USER_FINISH_LOGIN,
          errorCode: ErrorCode.ALREADY_LOGGED,
        },
        credential: {
          ...sessionData.user,
          apiKey: authenticationToken
        },
        status: HTTP_CODE.UNAUTHORIZED
      }
    ])('send otp failed with $describe', ({ credential, expected, status }, done) => {
      const sendOtpEmail = jest.spyOn(EmailService, 'sendOtpEmail').mockResolvedValue();
      fetch.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(credential)
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api.post(sendOtpUrl)
            .set('Cookie', cookie)
            .send(requestBody)
            .expect(status)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(fetch).not.toHaveBeenCalled();
              expect(sendOtpEmail).not.toHaveBeenCalled();
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });

    test.each([
      {
        describe: 'user not found',
        expected: {
          message: USER.USER_NOT_FOUND,
          errorCode: ErrorCode.CREDENTIAL_NOT_MATCH
        },
        status: HTTP_CODE.UNAUTHORIZED
      },
      {
        describe: 'bad request',
        expected: {
          message: getInputValidateMessage(USER.UPDATE_OTP_CODE_FAIL),
        },
        status: HTTP_CODE.BAD_REQUEST
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('send otp failed with $describe', ({ expected, status }, done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));
      const sendOtpEmail = jest.spyOn(EmailService, 'sendOtpEmail').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, apiKey: null })
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api
            .post(sendOtpUrl)
            .set('Cookie', cookie)
            .send(requestBody)
            .expect(status)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(fetch).toHaveBeenCalledTimes(1);
              expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining(sendOtpInternalUrl),
                expect.objectContaining({
                  method: METHOD.POST,
                  headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Cookie': cookie,
                  }),
                  body: JSON.stringify(requestBody)
                }
              ));
              expect(sendOtpEmail).not.toHaveBeenCalled();
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });
  });

  commonTest('send otp internal api common test', [
    {
      name: 'cors test',
      describe: 'send otp internal api cors',
      url: sendOtpInternalUrl,
      method: METHOD.POST.toLowerCase(),
    }
  ], 'send otp internal');

  describe(createDescribeTest(METHOD.POST, sendOtpInternalUrl), () => {
    afterAll((done) => globalThis.TestServer.removeTestMiddleware(done));

    test('send otp internal api will be success', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          ...sessionData.user,
          apiKey: null,
        };
      });

      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      expect.hasAssertions();
      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.OK)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                email: sessionData.user.email,
                mfa_enable: true,
              },
              data: {
                otp_code: expect.stringMatching(/(\d+){6}/)
              }
            }
          ));
          expect(response.body.otp).toHaveLength(6);
          expect(response.body).toEqual({
            message: USER.OTP_HAS_BEEN_SENT,
            otp: mockUser.otp_code
          });
          done();
        });
    });

    test('send otp internal api failed with user not found', (done) => {
      globalThis.prismaClient.user.update.mockRejectedValue(PrismaNotFoundError);

      expect.hasAssertions();
      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
            where: {
              email: sessionData.user.email,
              mfa_enable: true,
            },
            data: {
              otp_code: expect.stringMatching(/(\d+){6}/)
            }
          }));
          expect(response.body).toEqual({
            message: USER.USER_NOT_FOUND,
            errorCode: ErrorCode.CREDENTIAL_NOT_MATCH,
          });
          done();
        });
    });

    test('send otp internal api failed with bad request', (done) => {
      const badRequestBody = {};

      expect.hasAssertions();
      globalThis.api.post(sendOtpInternalUrl)
        .send(badRequestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.UPDATE_OTP_CODE_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
          });
          expect(response.body.errors).toHaveLength(1);
          done();
        });
    });

    test('send otp internal api failed with output validate error', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({ data: { otp: generateOtp() } })
      );

      expect.hasAssertions();
      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                email: mockUser.email,
                mfa_enable: true,
              },
              data: {
                otp_code: expect.stringMatching(/(\d+){6}/)
              }
            })
          );
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test('send otp internal api failed with unknown error', (done) => {
      globalThis.prismaClient.user.update.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
            where: {
              email: sessionData.user.email,
              mfa_enable: true,
            },
            data: {
              otp_code: expect.stringMatching(/(\d+){6}/)
            }
          }));
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE
          });
          done();
        });
    });
  });
});
