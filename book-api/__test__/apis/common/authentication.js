const { HTTP_CODE } = require('#constants');
const { JsonWebTokenError, TokenExpiredError } = require('#test/mocks/json-web-token-error');
const { COMMON, USER } = require('#messages');
const utils = require('#utils');
const { authenticationToken, mockUser } = require('#test/resources/auth');
const authentication = require('#middlewares/auth/authentication');

module.exports = describe('authentication', () => {
  afterEach((done) => {
    jest.restoreAllMocks();
    done();
  });

  test('authentication success', (done) => {
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
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalled();
    done();
  });

  test('authentication failed with session unset', (done) => {
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationToken,
      session: {}
    };
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
    }));
    done();
  });

  test('authentication failed with token does not have', (done) => {
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: {}
    };
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
    }));
    done();
  });

  test('authentication failed with session api token and authentication token are difference', (done) => {
    const authenticationTokenFake = utils.signLoginToken(Date.now(), mockUser.email, 1);
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      authorization: authenticationTokenFake,
      session: {
        user: {
          email: mockUser.email,
          apiKey: authenticationToken,
          power: mockUser.power,
          mfaEnable: mockUser.mfa_enable,
        },
      }
    };
    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_NOT_FOUND,
    }));
    done();
  });

  test('authentication failed with verify authentication token get expired error', (done) => {
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new TokenExpiredError('jwt expired');
    });

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
      }
    };

    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.RESET_PASSWORD_TOKEN_EXPIRE
    }));
    done();
  });

  test('authentication failed with verify authentication token get token invalid error', (done) => {
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new JsonWebTokenError('jwt malformed');
    });

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
      }
    };

    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.AUTHENTICATION_TOKEN_INVALID
    }));
    done();
  });

  test('authentication failed with another error', (done) => {
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new Error('Server error!');
    });

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
      }
    };

    authentication(globalThis.expressMiddleware.req, globalThis.expressMiddleware.res, globalThis.expressMiddleware.next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.SERVER_ERROR);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.INTERNAL_ERROR_MESSAGE
    }));
    done();
  });
});
