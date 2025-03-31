const { checkArrayHaveValues } = require('#utils');

/**
 * Format string follow string annotation. (ex: {1} {2})
 *
 * @param {...*} args - The arguments.
 * @return {string} - The string formatted.
 */
String.prototype.format = function (...args) {
  let primitiveValue = this;
  const matches = this.match(/\{\d+\}/g);

  if (checkArrayHaveValues(matches)) {
    matches.sort((matchA, matchB) => {
      const orderA = +matchA.match(/\d+/)[0];
      const orderB = matchB.match(/\d+/)[0];
      return orderA - orderB;
    });

    matches.forEach((match, index) => {
      if (args[index]) {
        primitiveValue = primitiveValue.replace(match, args[index]);
      }
    });
  }

  return primitiveValue;
};
