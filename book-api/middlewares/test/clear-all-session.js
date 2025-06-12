/**
 * Clear all session data for testing.
 *
 * @param {object} req - express request.
 * @param {object} res - express response.
 */
module.exports = (req, res) => {
  req.sessionStore.clear();
  res.end();
};
