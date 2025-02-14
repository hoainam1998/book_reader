const isRangeContain = (value, range, message) => {
  if (!range.includes(value)) {
    return message;
  }
};

/**
 * This callback will validate value by conditions passed to it.
 *
 * @callback validateFunction
 * @param {*} value - The value to validate.
 * @param {number[]} range - The range will check if value in it, then result is true.
 * @param {string} message - The error message.
 * @return {(string | void)} - The error message if validate result is false.
 */

/**
 * This callback will validate value by conditions passed to it.
 *
 * @param {number[]} value - The value to validate.
 * @param {string} message - The error message.
 * @return {validateFunction} The validate function.
 */
const IsRangeContain = (range, message) => {
  return (value) => isRangeContain(value, range, message);
};

module.exports = IsRangeContain;
