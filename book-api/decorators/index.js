const { validate, parse } = require('graphql');
const upload = require('./upload.js');
const uploadPdf = require('./upload-pdf-file.js');
const { HTTP_CODE } = require('../constants/index.js');
const { messageCreator } = require('../utils/index.js');

/**
 * Return validate query decorator.
 *
 * @param {Object} - decorator object.
 * @returns {Object} - decorator object.
 */
const validateQuery =
  (target) => {
    const originalMethod = target.descriptor.value;
    target.descriptor.value = function (...args) {
      const request = args[0];
      const response = args[1];
      const schema = args[3];
      try {
        const queryAst = parse(request.body.query);
        const errors = validate(schema, queryAst);
        if (errors.length > 0) {
          const errorText = errors.reduce((text, error, index) => {
            if (index < errors.length - 1) {
              return text += error.message + '\n';
            }
            return text += error.message;
          }, '');
          return response.status(HTTP_CODE.BAD_REQUEST).json(messageCreator(errorText));
        }
        args[0].body.query = queryAst;
        return originalMethod.apply(null, args);
      } catch (error) {
        return {
          json: messageCreator(error.message),
          status: HTTP_CODE.BAD_REQUEST
        };
      }
    }
    return target;
  };

/**
 * Return function validate result query execute decorator.
 *
 * @param {Number} - http code.
 * @returns {Function} - decorator function.
 */
const validateResultExecute = (httpCode) => {
  return (target) => {
    const originalMethod = target.descriptor.value;
    target.descriptor.value = function (...args) {
      const response = args[1];
      try {
        const result = originalMethod.apply(null, args);
        if (result instanceof Promise) {
          result.then(result => {
            const resultClone = JSON.parse(JSON.stringify(result));
            if (resultClone.errors) {
              const message = resultClone.errors[0].message;
              const status = resultClone.errors[0].extensions.http.status;

              response.status(status).json(messageCreator(message));
            } else {
              response.status(httpCode).json(resultClone.data);
            }
          });
        } else if (result.errors) {
          const errorText = result.errors.reduce((text, error, index) => {
            if (index < result.errors.length - 1) {
              return text += error.message + '\n';
            }
            return text += error.message;
          }, '');
          response.status(HTTP_CODE.BAD_REQUEST).json(messageCreator(errorText));
        } else if (result.data) {
          response.status(httpCode).json(result.data);
        } else {
          response.status(result.status).json(result.json);
        }
      } catch (error) {
        response.status(HTTP_CODE.BAD_REQUEST).json(messageCreator(error.message));
      }
    };
    return target;
  };
};

module.exports = {
  validateQuery,
  validateResultExecute,
  upload,
  uploadPdf,
};
