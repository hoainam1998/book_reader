/**
 * Sign session data for testing.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 */
const signedTestCookie = (req, res) => {
  req.session.user = req.body
  res.end();
};

module.exports = signedTestCookie;
