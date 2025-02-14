// Note: This comment is temp, will be replace if I found the right description.
/**
 * This callback will validate value by conditions passed to it.
 *
 * @callback conditionFunction
 * @param {*} value - The value to validate.
 * @return {boolean} - The validate result.
 */

/**
 * This callback will validate value by conditions passed to it.
 *
 * @callback validateFunction
 * @param {*} value - The value to validate.
 * @param {string} message - The error message.
 * @return {(string | void)} - The error message if validate result is false.
 */

/**
 * Return validate function, which will run when validate object and throw error message if result is false.
 *
 * @param {conditionFunction} conditionFn - The condition function.
 * @returns {validateFunction} - The validate function.
 */
const validate = (conditionFn) => {
  return (value, message) => {
    if (!conditionFn(value)) {
      return message;
    }
  };
};

/**
 * Function wrapper validate function.
 *
 * @callback specificValidateFunction
 * @param {*} value - The value to validate.
 * @return {(string | void)} - The error message if validate result is false.
 */

/**
 * Return specific validate function.
 *
 * @callback validateWrapper
 * @param {string} message - The error message.
 * @returns {specificValidateFunction} - The validate function.
 */

/**
 * Return validate util function, which accept message and return the another function wrap validate function.
 *
 * @param {validateFunction} validateFn - The validate function.
 * @returns {validateWrapper} - The validate function.
 */
const validating = (validateFn) => {
  return (message, options) => {
    if (options) {
      return {
        groups: options.groups,
        validator: (value) => validateFn(value, message)
      };
    } else {
      return (value) => validateFn(value, message);
    }
  };
};

module.exports = {
  validate,
  validating,
};
