const fetch = require('node-fetch');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const GraphqlResponse = require('#dto/common/graphql-response');
const EmailService = require('#services/email');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, otpCode } = require('#test/resources/auth');
const { generateOtp } = require('#utils');
const commonTest = require('#test/apis/common/common');
const sendOtpUrl = `${PATH.USER}/send-otp`;
const sendOtpInternalUrl = `${PATH.USER}/update-otp`;

const requestBody = {
  email: mockUser.email,
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

  describe('send otp api test', () => {
    afterEach((done) => {
      jest.restoreAllMocks();
      fetch.mockClear();
      done();
    });

    test('send otp will be success', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          email: mockUser.email,
          mfaEnable: mockUser.mfa_enable,
          apiKey: null,
          power: mockUser.power,
        };
      });

      const sendOtpEmail = jest.spyOn(EmailService, 'sendOtpEmail').mockResolvedValue();

      fetch.mockResolvedValue(new Response(JSON.stringify({
        otp: otpCode,
        message: USER.OTP_HAS_BEEN_SENT
      }), { status: HTTP_CODE.OK }));

      globalThis.api.post(sendOtpUrl)
        .send(requestBody)
        .expect(HTTP_CODE.OK)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(sendOtpInternalUrl),
            expect.objectContaining({
            method: METHOD.POST,
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify(requestBody)
          }));
          expect(sendOtpEmail).toHaveBeenCalledWith(expect.stringMatching(mockUser.email), expect.stringMatching(otpCode));
          expect(response.body).toMatchObject({
            message: USER.OTP_HAS_BEEN_SENT
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
        status: HTTP_CODE.UNAUTHORIZED
      },
      {
        describe: 'bad request',
        expected: {
          message: `${USER.UPDATE_OTP_CODE_FAIL}\n${COMMON.INPUT_VALIDATE_FAIL}`,
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
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          email: mockUser.email,
          mfaEnable: mockUser.mfa_enable,
          apiKey: null,
          power: mockUser.power,
        };
      });

      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));

      const sendOtpEmail = jest.spyOn(EmailService, 'sendOtpEmail').mockResolvedValue();

      globalThis.api
        .post(sendOtpUrl)
        .send(requestBody)
        .expect(status)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(sendOtpInternalUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            }
          ));
          expect(sendOtpEmail).not.toHaveBeenCalled();
          expect(response.body).toMatchObject(expected);
          done();
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

  describe('send otp internal test', () => {

    test('send otp internal api will be success', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.OK)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
            where: {
              email: mockUser.email,
              mfa_enable: true,
            },
            data: {
              otp_code: expect.any(String)
            }
          }));
          expect(response.body.otp).toHaveLength(6);
          expect(response.body).toMatchObject({
            message: USER.OTP_HAS_BEEN_SENT,
            otp: mockUser.otp_code
          });
          done();
        });
    });

    test('send otp internal api failed with user not found', (done) => {
      globalThis.prismaClient.user.update
        .mockRejectedValue(new PrismaClientKnownRequestError('Record not found!', { code: 'P2025' }));

      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(expect.objectContaining({
            where: {
              email: mockUser.email,
              mfa_enable: true,
            },
            data: {
              otp_code: expect.any(String)
            }
          }));
          expect(response.body).toMatchObject({
            message: USER.USER_NOT_FOUND,
          });
          done();
        });
    });

    test('send otp internal api failed with bad request', (done) => {
      const badRequestBody = {
        query: requestBody.query
      };

      globalThis.api.post(sendOtpInternalUrl)
        .send(badRequestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: `${USER.UPDATE_OTP_CODE_FAIL}\n${COMMON.INPUT_VALIDATE_FAIL}`,
          });
          done();
        });
    });

    test('send otp internal api failed with output validate error', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({ data: { otp: generateOtp() } })
      );

      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test('send otp internal api failed with unknown error', (done) => {
      globalThis.prismaClient.user.update.mockRejectedValue(new Error('Server error!'));

      globalThis.api.post(sendOtpInternalUrl)
        .send(requestBody)
        .expect(HTTP_CODE.SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: COMMON.INTERNAL_ERROR_MESSAGE
          });
          done();
        });
    });
  });
});
