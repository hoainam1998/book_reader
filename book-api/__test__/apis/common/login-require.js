const { HTTP_CODE } = require('#constants');
const { USER } = require('#messages');
const { authenticationToken, mockUser } = require('#test/resources/auth');
const loginRequire = require('#middlewares/auth/login-require');

module.exports = describe('login require test', () => {
  test('have logged and pass to next middleware', (done) => {
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: {
        user: {
          email: mockUser.email,
          apiKey: authenticationToken,
          power: mockUser.power,
          mfaEnable: mockUser.mfa_enable,
        },
      },
    };

    loginRequire(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalled();
    done();
  });

  test('have not logged and throw unauthorized', (done) => {
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: {},
    };

    loginRequire(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
    }));
    done();
  });
});
