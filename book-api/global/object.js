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
  if (Array.isArray(this) && !Array.isArray(valueToCompare)) {
    return false;
  } else if (Array.isArray(this) && Array.isArray(valueToCompare)) {
    if (this.length === valueToCompare.length) {
      if (this.length === 0 && valueToCompare.length === 0) {
        return true;
      }
      return this.every((v, index) => v.isValueEqual(valueToCompare[index]));
    }
    return false;
  } else if (this instanceof Object && valueToCompare instanceof Object) {
    // if they are plain object, compare value property of them.
    if (Object.keys(this).length && Object.keys(valueToCompare).length) {
      return Array.from(Object.entries(this)).every(([key, val]) => {
        if (typeof val === 'object' && typeof valueToCompare[key] === 'object' && !!val) {
          return val.isValueEqual(valueToCompare[key]);
        }
        return val === valueToCompare[key];
      });
    } else {
      return false;
    }
  } else {
    // compare value, if they are primitive value.
    return this === valueToCompare;
  }
};

/**
 * Check object is empty or not.
 *
 * @return {boolean} - The result compare.
 */
const isEmpty = function () {
  if (Object.keys(this).length === 0) {
    return true;
  } else {
    return Object.values(this).every((v) => v === null || v === undefined);
  }
};

/**
 * Check some properties has contain in target object.
 *
 * @param {...string} keys - The property names array.
 * @return {boolean} - The result compare.
 */
const isDefined = function (...keys) {
  if (this.isEmpty()) {
    return false;
  } else {
    return keys.every((key) => Object.hasOwn(this, key));
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
  isEmpty: {
    writable: false,
    configurable: false,
    enumerable: false,
    value: isEmpty,
  },
  isDefined: {
    writable: false,
    configurable: false,
    enumerable: false,
    value: isDefined,
  },
});
