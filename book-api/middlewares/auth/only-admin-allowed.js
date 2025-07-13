const { HTTP_CODE, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { messageCreator } = require('#utils');
const Logger = require('#services/logger');
const logger = new Logger('Admin allowed!');

/**
 * Checking user dose have permission to execute this behavior.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @return - by next middleware if pass, otherwise return unauthorized json response.
 */
const onlyAdminAllowed = (req, res, next) => {
  try {
    if (req.session.user.role === POWER.ADMIN) {
      // if user have a right role, then switch to next middleware.
      return next();
    } else {
      // else return unauthorized message
      logger.warn('unauthorized error');
      return res.status(HTTP_CODE.NOT_PERMISSION).json(messageCreator(USER.NOT_PERMISSION));
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(HTTP_CODE.SERVER_ERROR).json(messageCreator(COMMON.INTERNAL_ERROR_MESSAGE));
  }
};

module.exports = onlyAdminAllowed;
