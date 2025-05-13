const destroySession = (req, res) => {
  req.session.destroy();
  res.end();
};

module.exports = destroySession;
