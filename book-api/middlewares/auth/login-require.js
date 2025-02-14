const { verify } = require('jsonwebtoken');
const { HTTP_CODE } = require('#constants');
const { messageCreator } = require('#utils');

/**
 * Checking user have login yet.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @return - by next middleware if pass, otherwise return unauthorized json response.
 */
const loginRequire = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization) {
    // verify token
    const login = verify(authorization, process.env.SECRET_KEY_LOGIN);
    if (login && login.isLogin) {
      // if user already login, then switch to next middleware.
      return next();
    } else {
      // else return unauthorized message
      return res.status(HTTP_CODE.UNAUTHORIZED)
        .json(messageCreator('Your are not permission!'));
    }
  }
  // if token have not, also return unauthorized message.
  return res.status(HTTP_CODE.UNAUTHORIZED)
    .json(messageCreator('Your have not login yet!'));
};

module.exports = loginRequire;
