const { HTTP_CODE } = require('#constants');
const { COMMON, USER } = require('#messages');
const { messageCreator, verifyLoginToken } = require('#utils');
const Logger = require('#services/logger');
const logger = new Logger('Authentication');

/**
 * Checking user have login yet and passed mfa session.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @return - by next middleware if pass, otherwise return unauthorized json response.
 */
const authentication = (req, res, next) => {
  try {
    const authorization = req.get('authorization');
    if (authorization && req.session.user) {
      // verify token
      if (req.session.user.apiKey === authorization) {
        verifyLoginToken(authorization);
        // if user already passed mfa, then switch to next middleware.
        return next();
      } else {
        logger.warn('user not found!');
        return res.status(HTTP_CODE.UNAUTHORIZED)
          .json(messageCreator(USER.USER_NOT_FOUND));
      }
    }
    // if token have not, also return unauthorized message.
    logger.warn('unauthorized error');
    return res.status(HTTP_CODE.UNAUTHORIZED)
      .json(messageCreator(USER.USER_UNAUTHORIZED));
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_CODE.UNAUTHORIZED)
        .json(messageCreator(COMMON.RESET_PASSWORD_TOKEN_EXPIRE));
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_CODE.UNAUTHORIZED)
        .json(messageCreator(COMMON.AUTHENTICATION_TOKEN_INVALID));
    }

    logger.error(error.message);
    return res.status(HTTP_CODE.SERVER_ERROR)
      .json(messageCreator(COMMON.INTERNAL_ERROR_MESSAGE));
  }
};

module.exports = authentication;