const { verify } = require('jsonwebtoken');
const { HTTP_CODE, INTERNAL_ERROR_MESSAGE } = require('#constants');
const { messageCreator } = require('#utils');

/**
 * Checking user have login yet and passed mfa session.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @return - by next middleware if pass, otherwise unauthorized json response.
 */
const authentication = (req, res, next) => {
  try {
    const authorization = req.get('authorization');
    if (authorization) {
      // verify token
      const user = verify(authorization, process.env.SECRET_KEY);
      if (user && user.userId) {
        // if user already passed mfa, then switch to next middleware.
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
  } catch {
    return res.status(HTTP_CODE.SERVER_ERROR)
      .json(messageCreator(INTERNAL_ERROR_MESSAGE));
  }
};

module.exports = authentication;