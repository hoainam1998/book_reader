const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');
const Logger = require('#services/logger');
const logger = new Logger('Validate url');

/**
 * Check request method and url are matching with express route system, if not return bad request.
 *
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {Object} next - next function.
 * @param {Array} layers - route layer function.
 */
module.exports = (req, res, next, layers) => {
  const realUrl = /(?!^(\/\w+))(\/(\w|-)+){1,2}/.exec(req.originalUrl)[0];
  const layerFound = layers.find(layer => layer.route.test(req.originalUrl) && layer.endpoint.test(realUrl));
  if (layerFound) {
    if (layerFound.methods[req.method.toLowerCase()]) {
      next();
    } else {
      logger.error(`Method ${req.method} not allowed for ${req.originalUrl} url!`);
      res.status(HTTP_CODE.METHOD_NOT_ALLOWED).json(messageCreator(`Method ${req.method} not allowed for ${req.originalUrl} url!`));
    }
  } else {
    logger.error(`Can not found ${req.originalUrl}!`);
    res.status(HTTP_CODE.NOT_FOUND).json(messageCreator(`Can not found ${req.originalUrl}!`));
  }
};
