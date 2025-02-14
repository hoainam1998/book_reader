const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');

/**
 * Check request method and url are matching with express route system, if not return bad request.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @param {Array} routeLayers - route layer function.
 */
module.exports = (req, res, next, layers) => {
  const realUrl = /(?!^(\/\w+))(\/(\w|-)+){1,2}/.exec(req.originalUrl)[0];
  const layerFound = layers.find(layer => layer.route.test(req.originalUrl) && layer.endpoint.test(realUrl));
  if (layerFound) {
    if (layerFound.methods[req.method.toLowerCase()]) {
      next();
    } else {
      res.status(HTTP_CODE.BAD_REQUEST).json(messageCreator('Method in valid!'));
    }
  } else {
    res.status(HTTP_CODE.BAD_REQUEST).json(messageCreator('Url in valid!'));
  }
};
