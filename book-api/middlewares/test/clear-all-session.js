const Logger = require('#services/logger');
const logger = new Logger('Redis error');

/**
 * Clear all session data for testing.
 *
 * @param {object} req - express request.
 * @param {object} res - express response.
 */
module.exports = (req, res) => {
  req.sessionStore.clear((error) => logger.log(error.message));
  res.end();
};
