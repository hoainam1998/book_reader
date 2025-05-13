const { HTTP_CODE } = require('#constants');
const { USER } = require('#messages');
const { authenticationToken, sessionData } = require('#test/resources/auth');
const ErrorCode = require('#services/error-code');
const loginRequire = require('#middlewares/auth/login-require');

module.exports = describe('login require', () => {
  test('have logged and pass to next middleware', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: sessionData
    };

    loginRequire(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalled();
    done();
  });

  test('have not logged and throw unauthorized', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: {},
    };

    loginRequire(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
      errorCode: ErrorCode.HAVE_NOT_LOGIN,
    }));
    done();
  });
});
