/**
 * Return freezed object.
 *
 * @param {object} - constant object.
 * @returns {object} - freezed object.
 */
const deepFreeze = (object) => {
  for (const key in object) {
    if (object[key] instanceof Object) {
      object[key] = deepFreeze(object[key]);
    };
  }
  return Object.freeze(object);
};

module.exports = {
  deepFreeze
};
