const isValueEqual = function (valueToCompare) {
  if (!valueToCompare || !this) {
    return false;
  }

  if (Array.isArray(this) && Array.isArray(valueToCompare)) {
    if (this.length === valueToCompare.length) {
      return this.every((v, index) => v.isValueEqual(valueToCompare[index]));
    }
    return false;
  } else if (this instanceof Object && valueToCompare instanceof Object) {
    return Array.from(Object.entries(this)).every(
      ([key, val]) => {
        if (typeof val === 'object' && typeof valueToCompare[key] === 'object' && !!val) {
          return val.isValueEqual(valueToCompare[key]);
        }
        return val === valueToCompare[key];
      }
    );
  } else {
    return this === valueToCompare;
  }
};

Object.defineProperties(Object.prototype, {
  isValueEqual: {
    writable: false,
    configurable: false,
    enumerable: false,
    value: isValueEqual,
  },
});
