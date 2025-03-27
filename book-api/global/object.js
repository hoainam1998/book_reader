/**
 * Compare value of object is equal or not.
 *
 * @param {Object} valueToCompare
 * @return {boolean} - The result compare.
 */
const isValueEqual = function (valueToCompare) {
  if (!valueToCompare || !this) {
    return false;
  }

  // if two object are array and length of them is same,
  // loop through and compare all elements.
  if (Array.isArray(this) && Array.isArray(valueToCompare)) {
    if (this.length === valueToCompare.length) {
      return this.every((v, index) => v.isValueEqual(valueToCompare[index]));
    }
    return false;
  } else if (this instanceof Object && valueToCompare instanceof Object) {
    // if they are plain object, compare value property of them.
    return Array.from(Object.entries(this)).every(
      ([key, val]) => {
        if (typeof val === 'object' && typeof valueToCompare[key] === 'object' && !!val) {
          return val.isValueEqual(valueToCompare[key]);
        }
        return val === valueToCompare[key];
      }
    );
  } else {
    // compare value, if they are primitive value.
    return this === valueToCompare;
  }
};

/**
 * [Danger] These are all global property. So you should remind yourself very carefully after add any property add here.
 * Adding property to global it must be handle by those who will take the highest responsibility for entire project.
 */
Object.defineProperties(Object.prototype, {
  isValueEqual: {
    writable: false,
    configurable: false,
    enumerable: false,
    value: isValueEqual,
  },
});
