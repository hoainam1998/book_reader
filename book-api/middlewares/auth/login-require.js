const { verify } = require('jsonwebtoken');
const { HTTP_CODE } = require('#constants');
const { COMMON } = require('#messages');
const { messageCreator } = require('#utils');
const Logger = require('#services/logger');
const logger = new Logger('Login require');

/**
 * Checking user have login yet.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @return - by next middleware if pass, otherwise return unauthorized json response.
 */
const loginRequire = (req, res, next) => {
  try {
    const authorization = req.get('authorization');
    if (authorization) {
      // verify token
      const login = verify(authorization, process.env.SECRET_KEY_LOGIN);
      if (login && login.isLogin) {
        // if user already login success, then switch to next middleware.
        return next();
      } else {
        // else return unauthorized message
        return res.status(HTTP_CODE.UNAUTHORIZED)
          .json(messageCreator('Your are not permission!'));
      }
    }
    // if token have not, also return unauthorized message.
    logger.warn('unauthorized error');
    return res.status(HTTP_CODE.UNAUTHORIZED)
      .json(messageCreator('Your have not login yet!'));
  } catch (error) {
    if (error.message === 'invalid signature') {
      return res.status(HTTP_CODE.UNAUTHORIZED)
        .json(messageCreator('Invalid authentication token!'));
    }
    logger.error(error.message);
    return res.status(HTTP_CODE.SERVER_ERROR)
      .json(messageCreator(COMMON.INTERNAL_ERROR_MESSAGE));
  }
};

module.exports = loginRequire;
