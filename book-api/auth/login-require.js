const { verify } = require('jsonwebtoken');
const { HTTP_CODE } = require('#constants');
const { messageCreator } = require('#utils');

const loginRequire = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization) {
    const user = verify(authorization, process.env.SECRET_KEY);
    if (user) {
      return next();
    } else {
      return res.status(HTTP_CODE.UNAUTHORIZED)
        .json(messageCreator('Your are not permission!'));
    }
  }
  return res.status(HTTP_CODE.UNAUTHORIZED)
    .json(messageCreator('Your have not login yet!'));
};

module.exports = loginRequire;
