const { HTTP_CODE } = require('#constants');
const { COMMON, USER } = require('#messages');
const utils = require('#utils');
const { messageCreator } = utils;
const Logger = require('#services/logger');
const ErrorCode = require('#services/error-code');
const logger = new Logger('Authentication');

/**
 * Prevent user login on multiple device.
 *
 * @param {object} req - express request.
 * @param {object} res - express response.
 * @param {object} next - next function.
 * @return - by next middleware if pass, otherwise return unauthorized json response.
 */
module.exports = async (req, res, next) => {
  try {
    const user = await req.sessionStore.client.get(`book-app:${req.session.id}`);
    if (user) {
      res.status(HTTP_CODE.UNAUTHORIZED)
        .json(messageCreator(USER.ONLY_ONE_DEVICE, ErrorCode.ONLY_ALLOW_ONE_DEVICE));
    } else {
      return next();
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(HTTP_CODE.SERVER_ERROR)
      .json(messageCreator(COMMON.INTERNAL_ERROR_MESSAGE));
  }
};
