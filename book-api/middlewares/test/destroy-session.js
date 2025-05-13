/**
 * Destroy session data for testing.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 */
const destroySession = (req, res) => {
  req.session.destroy();
  res.end();
};

module.exports = destroySession;
