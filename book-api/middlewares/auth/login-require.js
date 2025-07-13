const { HTTP_CODE } = require('#constants');
const { COMMON, USER } = require('#messages');
const { messageCreator } = require('#utils');
const ErrorCode = require('#services/error-code');
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
    if (req.session.isDefined('user') && req.session.user.isDefined('email', 'mfaEnable')) {
      // if user already login success, then switch to next middleware.
      return next();
    } else {
      // else return unauthorized message
      logger.warn('unauthorized error');
      return res.status(HTTP_CODE.UNAUTHORIZED).json(messageCreator(USER.USER_UNAUTHORIZED, ErrorCode.HAVE_NOT_LOGIN));
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(COMMON.INTERNAL_ERROR_MESSAGE));
  }
};

module.exports = loginRequire;
