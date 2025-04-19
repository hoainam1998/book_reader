const { HTTP_CODE } = require('#constants');
const { JsonWebTokenError, TokenExpiredError } = require('#test/mocks/json-web-token-error');
const { COMMON, USER } = require('#messages');
const utils = require('#utils');
const { signLoginToken } = utils;
const { authenticationToken, mockUser } = require('#test/resources/auth');
const authentication = require('#middlewares/auth/authentication');

let req = {
  get: function(field) {
    return this[field];
  },
  authorization: authenticationToken,
};
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
const next = jest.fn();

module.exports = describe('authentication test', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    res.status.mockClear();
    res.json.mockClear();
  });

  beforeAll(() => {
    jest.restoreAllMocks();
  });

  test('authentication success', (done) => {
    req = {
      ...req,
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
    authentication(req, res, next);
    expect(next).toHaveBeenCalled();
    done();
  });

  test('authentication failed with session unset', (done) => {
    req = {
      ...req,
      authorization: authenticationToken,
      session: {}
    };
    authentication(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
    }));
    done();
  });

  test('authentication failed with token does not have', (done) => {
    req = {
      ...req,
      session: {}
    };
    authentication(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_UNAUTHORIZED,
    }));
    done();
  });

  test('authentication failed with session api token and authentication token are difference', (done) => {
    const authenticationTokenFake = signLoginToken(Date.now(), mockUser.email, 1);
    req = {
      ...req,
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
    authentication(req, res, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: USER.USER_NOT_FOUND,
    }));
    done();
  });

  test('authentication failed with verify authentication token get expired error', (done) => {
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new TokenExpiredError('jwt expired');
    });

    req = {
      ...req,
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

    authentication(req, res, next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.RESET_PASSWORD_TOKEN_EXPIRE
    }));
    done();
  });

  test('authentication failed with verify authentication token get token invalid error', (done) => {
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new JsonWebTokenError('jwt malformed');
    });

    req = {
      ...req,
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

    authentication(req, res, next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.AUTHENTICATION_TOKEN_INVALID
    }));
    done();
  });

  test('authentication failed with another error', (done) => {
    const verifyLoginTokenMock = jest.spyOn(utils, 'verifyLoginToken').mockImplementation(() => {
      throw new Error('Server error!');
    });

    req = {
      ...req,
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

    authentication(req, res, next);
    expect(verifyLoginTokenMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_CODE.SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: COMMON.INTERNAL_ERROR_MESSAGE
    }));
    done();
  });
});
