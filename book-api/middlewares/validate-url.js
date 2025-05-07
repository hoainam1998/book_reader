const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');
const ErrorCode = require('#services/error-code');
const Logger = require('#services/logger');
const { COMMON } = require('#messages');
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
  const matches = /(?!^(\/\w+))(\/(\w|-)+){1,2}/.exec(req.originalUrl);
  if (matches && matches.length) {
    const realUrl = matches[0];
    const layerFound = layers.find(layer => layer.route.test(req.originalUrl) && layer.endpoint.test(realUrl));

    if (layerFound) {
      if (layerFound.methods[req.method.toLowerCase()]) {
        return next();
      } else {
        const methodNotAllowed = COMMON.METHOD_NOT_ALLOWED.format(req.method, req.originalUrl);
        logger.error(methodNotAllowed);
        return res.status(HTTP_CODE.METHOD_NOT_ALLOWED)
          .json(messageCreator(methodNotAllowed));
      }
    }
  }
  const urlInvalid = COMMON.URL_INVALID.format(req.originalUrl);
  logger.error(urlInvalid);
  res.status(HTTP_CODE.NOT_FOUND).json(messageCreator(urlInvalid, ErrorCode.URL_NOT_FOUND));
};
