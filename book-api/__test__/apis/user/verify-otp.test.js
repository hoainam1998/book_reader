const fetch = require('node-fetch');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const GraphqlResponse = require('#dto/common/graphql-response');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const { signLoginToken } = require('#utils');
const { mockUser, authenticationToken, otpCode } = require('#test/resources/auth');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const verifyOtpUrl = `${PATH.USER}/verify-otp`;
const verifyOtpInternalUrl = `${PATH.USER}/verify-otp-process`;

const requestBody = {
  email: mockUser.email,
  otp: otpCode,
  query: {
    apiKey: true
  },
};

describe(createDescribeTest(METHOD.POST, verifyOtpUrl), () => {
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

  describe('verify otp test', () => {
    afterEach((done) => {
      jest.restoreAllMocks();
      fetch.mockClear();
      done();
    });

    test('verify otp success', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          email: mockUser.email,
          mfaEnable: mockUser.mfa_enable,
          apiKey: null,
          power: mockUser.power,
        };
      });

      fetch.mockResolvedValue(new Response(JSON.stringify({
        apiKey: authenticationToken
      }), { status: HTTP_CODE.OK }));

      globalThis.api.post(verifyOtpUrl)
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
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(response.body).toMatchObject({
            apiKey: authenticationToken
          });
          done();
        });
    });

    test.each([
      {
        describe: 'user not found',
        expected: {
          message: USER.VERIFY_OTP_FAIL_DUE_MISSING_OTP_OR_EMAIL
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
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          email: mockUser.email,
          mfaEnable: mockUser.mfa_enable,
          apiKey: null,
          power: mockUser.power,
        };
      });

      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));

      globalThis.api.post(verifyOtpUrl)
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
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(response.body).toMatchObject(expected);
          done();
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
    afterEach((done) => {
      jest.restoreAllMocks();
      done();
    });

    afterAll((done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          email: mockUser.email,
          mfaEnable: mockUser.mfa_enable,
          apiKey: null,
          power: mockUser.power,
        };
      });
      done();
    });

    test('verify otp internal will be success', (done) => {
      globalThis.prismaClient.user.update
        .mockResolvedValue({ ...mockUser, login_token: authenticationToken });

      globalThis.api
        .post(verifyOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.OK)
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
          expect(response.body).toMatchObject({
            apiKey: authenticationToken
          });
          done();
        });
    });

    test('verify otp internal failed with user not found', (done) => {
      globalThis.prismaClient.user.update
        .mockRejectedValue(new PrismaClientKnownRequestError('Record not found!', { code: 'P2025' }));

      globalThis.api
        .post(verifyOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
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
          expect(response.body).toMatchObject({
            message: USER.VERIFY_OTP_FAIL_DUE_MISSING_OTP_OR_EMAIL
          });
          done();
        });
    });

    test('verify otp internal failed with bad request', (done) => {
      const badRequestBody = {
        otp: requestBody.otp,
        query: requestBody.query,
      };

      globalThis.api
        .post(verifyOtpInternalUrl)
        .send(badRequestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: getInputValidateMessage(USER.VERIFY_OTP_FAIL),
          });
          done();
        });
    });

    test('verify otp internal failed with output validated error', (done) => {
      globalThis.prismaClient.user.update
        .mockResolvedValue({ ...mockUser, login_token: authenticationToken });

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({
          data: {
            apiKey: signLoginToken(Date.now(), mockUser.email, 1)
          }
        })
      );

      globalThis.api
        .post(verifyOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
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
          expect(response.body).toMatchObject({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test('verify otp internal failed with server error', (done) => {
      globalThis.prismaClient.user.update
        .mockRejectedValue(new Error('Server error!'));

      globalThis.api
        .post(verifyOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.SERVER_ERROR)
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
          expect(response.body).toMatchObject({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });
  });
});
