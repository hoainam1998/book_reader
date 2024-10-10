const { verify } = require('jsonwebtoken');
const { HTTP_CODE } = require('#constants');
const { messageCreator } = require('#utils');

const loginRequire = (req, res, next) => {
  const user = verify(req.get('authorization'), process.env.SECRET_KEY);
  if (user) {
    next();
  } else {
    res.status(HTTP_CODE.UNAUTHORIZED)
      .json(messageCreator('Your are not permission!'));
  }
};

module.exports = loginRequire;
