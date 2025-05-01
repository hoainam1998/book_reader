const { HTTP_CODE } = require('#constants');
const { USER } = require('#messages');
const { sessionData } = require('#test/resources/auth');
const otpAllowed = require('#middlewares/auth/otp-allowed');

module.exports = describe('otp allowed', () => {
  test('otp allowed with right conditions', (done) => {
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: {
        user: {
          ...sessionData.user,
          apiKey: null,
        },
      },
    };

    otpAllowed(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalled();
    done();
  });

  test('otp not allow when mfa turn off', (done) => {
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: {
        user: {
          ...sessionData.user,
          mfaEnable: false,
        },
      },
    };

    otpAllowed(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.MFA_UNENABLE,
    }));
    done();
  });

  test('otp not allow when user was logged in', (done) => {
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: sessionData
    };

    otpAllowed(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_FINISH_LOGIN,
    }));
    done();
  });
});
