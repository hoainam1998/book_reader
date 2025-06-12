/**
 * Sign session data for testing.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 */
const signedTestCookie = (req, res) => {
  let name = 'user';
  if (req.query.name) {
    name = req.query.name;
  }
  req.session[name] = req.body;
  res.send({ sessionId: req.session.id });
};

module.exports = signedTestCookie;
