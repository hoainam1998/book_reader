const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const GraphqlResponse = require('#dto/common/graphql-response');
const ErrorCode = require('#services/error-code');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const { signLoginToken } = require('#utils');
const { mockUser, authenticationToken, otpCode, sessionData, signedTestCookie } = require('#test/resources/auth');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const verifyOtpUrl = `${PATH.USER}/verify-otp`;
const verifyOtpInternalUrl = `${PATH.USER}/verify-otp-process`;

const requestBody = {
  otp: otpCode,
  query: {
    apiKey: true
  },
};

describe('verify otp', () => {
  commonTest('verify otp api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: verifyOtpUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'verify otp api cors',
      url: verifyOtpUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'verify otp common test');

  describe(createDescribeTest(METHOD.POST, verifyOtpUrl), () => {
    afterEach((done) => {
      fetch.mockClear();
      done();
    });

    test('verify otp success', (done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify({
        apiKey: authenticationToken
      })));

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, apiKey: null })
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api.post(verifyOtpUrl)
            .set('Cookie', cookie)
            .send(requestBody)
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(fetch).toHaveBeenCalledTimes(1);
              expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining(verifyOtpInternalUrl),
                expect.objectContaining({
                  method: METHOD.POST,
                  headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Cookie': cookie,
                  }),
                  body: JSON.stringify(requestBody)
                })
              );
              expect(response.body).toEqual({
                apiKey: authenticationToken
              });
              done();
            });
        });
    });

    test('verify otp failed due user have not login yet', (done) => {
      globalThis.api.post(verifyOtpUrl)
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.USER_UNAUTHORIZED,
            errorCode: ErrorCode.HAVE_NOT_LOGIN,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'user was turn off mfa state',
        expected: {
          message: USER.MFA_UNENABLE,
          errorCode: ErrorCode.MFA_TURN_OFF,
        },
        status: HTTP_CODE.UNAUTHORIZED,
        credential: {
          ...sessionData.user,
          mfaEnable: false,
        }
      },
      {
        describe: 'user has already logged',
        expected: {
          message: USER.USER_FINISH_LOGIN,
          errorCode: ErrorCode.ALREADY_LOGGED,
        },
        status: HTTP_CODE.UNAUTHORIZED,
        credential: {
          ...sessionData.user,
          apiKey: authenticationToken
        },
      }
    ])('verify otp failed with $describe', ({ expected, status, credential }, done) => {
      fetch.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(credential)
        .then((responseSign) => {
          globalThis.api.post(verifyOtpUrl)
            .set('Cookie', responseSign.header['set-cookie'])
            .send(requestBody)
            .expect(status)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(fetch).not.toHaveBeenCalled();
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });

    test.each([
      {
        describe: 'user not found',
        expected: {
          message: USER.VERIFY_OTP_FAIL_DUE_MISSING_OTP_OR_EMAIL,
          errorCode: ErrorCode.CREDENTIAL_NOT_MATCH,
        },
        status: HTTP_CODE.UNAUTHORIZED
      },
      {
        describe: 'bad request',
        expected: {
          message: getInputValidateMessage(USER.VERIFY_OTP_FAIL)
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
    ])('verify otp failed with $describe', ({ expected, status }, done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, apiKey: null })
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api.post(verifyOtpUrl)
            .set('Cookie', cookie)
            .send(requestBody)
            .expect(status)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(fetch).toHaveBeenCalledTimes(1);
              expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining(verifyOtpInternalUrl),
                expect.objectContaining({
                  method: METHOD.POST,
                  headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Cookie': cookie,
                  }),
                  body: JSON.stringify(requestBody)
                })
              );
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });
  });

  commonTest('verify otp internal api common test', [
    {
      name: 'cors test',
      describe: 'verify otp internal api cors',
      url: verifyOtpInternalUrl,
      method: METHOD.POST.toLowerCase(),
    }
  ], 'verify otp internal');

  describe(createDescribeTest(METHOD.POST, verifyOtpInternalUrl), () => {
    test('verify otp internal will be success', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, apiKey: null })
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api
            .post(verifyOtpInternalUrl)
            .set('Cookie', cookie)
            .send(requestBody)
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    email: mockUser.email,
                    otp_code: otpCode,
                    mfa_enable: true,
                  },
                  data: {
                    otp_code: null
                  }
                })
              );
              expect(response.body).toEqual({
                apiKey: expect.any(String),
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
          message: USER.VERIFY_OTP_FAIL_DUE_MISSING_OTP_OR_EMAIL,
        },
        status: HTTP_CODE.UNAUTHORIZED
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('verify otp internal failed with $describe', ({ cause, status, expected }, done) => {
      globalThis.prismaClient.user.update.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, apiKey: null })
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api
            .post(verifyOtpInternalUrl)
            .set('Cookie', cookie)
            .send(requestBody)
            .expect(status)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    email: mockUser.email,
                    otp_code: otpCode,
                    mfa_enable: true,
                  },
                  data: {
                    otp_code: null
                  }
                })
              );
              expect(response.body).toEqual(expected);
              done();
            });
          });
    });

    test('verify otp internal failed with bad request', (done) => {
      const badRequestBody = {
        query: requestBody.query,
      };

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, apiKey: null })
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api
            .post(verifyOtpInternalUrl)
            .set('Cookie', cookie)
            .send(badRequestBody)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(USER.VERIFY_OTP_FAIL),
                errors: expect.arrayContaining([expect.any(String)]),
              });
              done();
            });
        });
    });

    test('verify otp internal failed with output validated error', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({
          data: {
            apiKey: signLoginToken(Date.now(), mockUser.email, 1)
          }
        })
      );

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, apiKey: null })
        .then((responseSign) => {
          const cookie = responseSign.header['set-cookie'];
          globalThis.api
            .post(verifyOtpInternalUrl)
            .set('Cookie', cookie)
            .send(requestBody)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    email: mockUser.email,
                    otp_code: otpCode,
                    mfa_enable: true,
                  },
                  data: {
                    otp_code: null
                  }
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
});
