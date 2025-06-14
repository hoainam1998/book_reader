const { HTTP_CODE } = require('#constants');
const { USER } = require('#messages');
const ClientDummyData = require('#test/resources/dummy-data/client');
const ErrorCode = require('#services/error-code');
const clientLoginRequire = require('#middlewares/auth/client-login-require');
const sessionData = ClientDummyData.session;

module.exports = describe('login require', () => {
  test('have logged and pass to next middleware', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: sessionData
    };

    clientLoginRequire(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalled();
    done();
  });

  test('have not logged and throw unauthorized', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: {},
    };

    clientLoginRequire(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
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
