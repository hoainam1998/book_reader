const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');
const Logger = require('#services/logger');

/**
 * Handle unknown error.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 */
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  Logger.error('Express error', err.message);
  res.status(HTTP_CODE.SERVER_ERROR).send(messageCreator('Something broke!'));
};
