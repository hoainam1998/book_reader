const isValueEqual = function (value, valueToCompare) {
  if (!valueToCompare || !value) {
    return false;
  }

  if (Array.isArray(value) && Array.isArray(valueToCompare)) {
    if (value.length === valueToCompare.length) {
      return value.every((v, index) => isValueEqual(v, valueToCompare[index]));
    }
    return false;
  } else if (value instanceof Object && valueToCompare instanceof Object) {
    return Array.from(Object.entries(value)).every(
      ([key, val]) => {
        if (typeof val === 'object' && typeof valueToCompare[key] === 'object' && !!val) {
          return isValueEqual(val, valueToCompare[key]);
        }
        return val === valueToCompare[key];
      }
    );
  } else {
    return false;
  }
};

module.exports = isValueEqual;
