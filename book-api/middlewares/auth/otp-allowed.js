const { HTTP_CODE } = require('#constants');
const { USER } = require('#messages');
const { messageCreator } = require('#utils');
const Logger = require('#services/logger');
const ErrorCode = require('#services/error-code');
const logger = new Logger('Otp allowed!');

/**
 * Checking mfa have turned on for this user yet.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @return - by next middleware if pass, otherwise return unauthorized json response.
 */
const otpAllowed = (req, res, next) => {
  if (!req.session.user.mfaEnable) {
    logger.warn('Mfa turned off for this user!');
    return res.status(HTTP_CODE.UNAUTHORIZED).json(messageCreator(USER.MFA_UNENABLE, ErrorCode.MFA_TURN_OFF));
  } else if (req.session.user.apiKey) {
    logger.warn('User already has logged!');
    return res.status(HTTP_CODE.UNAUTHORIZED).json(messageCreator(USER.USER_FINISH_LOGIN, ErrorCode.ALREADY_LOGGED));
  }
  return next();
};

module.exports = otpAllowed;
