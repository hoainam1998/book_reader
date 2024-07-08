const { validate, parse, execute } = require('graphql');
const upload = require('./upload.js');

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
          return response.status(400).json({ message: errorText });
        }
        args[0].body.query = queryAst;
        return originalMethod.apply(null, args);
      } catch (error) {
        return response.status(400).json({ message: error.message });
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
        const promiseResult = originalMethod.apply(null, args);
        promiseResult.then(result => {
          const resultClone = JSON.parse(JSON.stringify(result));
          if (resultClone.errors) {
            const message = resultClone.errors[0].message;
            const status = resultClone.errors[0].extensions.http.status;
            response.status(status).json({ message });
          } else {
            response.status(httpCode).json(resultClone.data);
          }
        });
      } catch (error) {
        return response.status(400).json({ message: error.message });
      }
    };
    return target;
  };
};

module.exports = {
  validateQuery,
  validateResultExecute,
  upload
};
