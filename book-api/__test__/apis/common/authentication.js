const { HTTP_CODE } = require('#constants');
const { JsonWebTokenError, TokenExpiredError } = require('#test/mocks/json-web-token-error');
const { ServerError } = require('#test/mocks/other-errors');
const { COMMON, USER } = require('#messages');
const utils = require('#utils');
const { authenticationToken, mockUser, sessionData } = require('#test/resources/auth');
const authentication = require('#middlewares/auth/authentication');

module.exports = describe('authentication', () => {
  afterEach((done) => {
    jest.restoreAllMocks();
    done();
  });

  test('authentication success', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: sessionData
    };
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalled();
    expect(globalThis.expressMiddleware.next).toHaveBeenCalledTimes(1);
    done();
  });

  test('authentication failed with session unset', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: {}
    };
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
    }));
    done();
  });

  test('authentication failed with token does not have', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: {}
    };
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
    }));
    done();
  });

  test('authentication failed with session api token and authentication token are difference', (done) => {
    expect.hasAssertions();
    const authenticationTokenFake = utils.signLoginToken(Date.now(), mockUser.email, 1);
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationTokenFake,
      session: sessionData,
    };
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_NOT_FOUND,
    }));
    done();
  });

  test('authentication failed with verify authentication token get expired error', (done) => {
    expect.hasAssertions();
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new TokenExpiredError('jwt expired');
    });

    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: sessionData,
    };

    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.AUTHENTICATION_TOKEN_EXPIRE
    }));
    done();
  });

  test('authentication failed with verify authentication token get token invalid error', (done) => {
    expect.hasAssertions();
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new JsonWebTokenError('jwt malformed');
    });

    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: sessionData,
    };

    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.AUTHENTICATION_TOKEN_INVALID
    }));
    done();
  });

  test('authentication failed with another error', (done) => {
    expect.hasAssertions();
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw ServerError;
    });

    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: sessionData,
    };

    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.SERVER_ERROR);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.INTERNAL_ERROR_MESSAGE
    }));
    done();
  });
});
