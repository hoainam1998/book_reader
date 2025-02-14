const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');
const Logger = require('#services/logger.js');

module.exports = (err, req, res, next) => {
  Logger.error('Express error', err.message);
  res.status(HTTP_CODE.SERVER_ERROR).send(messageCreator('Something broke!'));
};
