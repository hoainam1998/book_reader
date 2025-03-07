const { validate, validating } = require('../helpers.js');

const isIds = validate((value) => {
  const checker = (valueValidate) =>
    /^([0-9])+$/.test(valueValidate) && typeof valueValidate === 'string' && valueValidate.length === 13;

  if (Array.isArray(value)) {
    return value.every((v) => checker(v));
  } else {
    return checker(value);
  }
});

const IsIds = validating(isIds);

module.exports = IsIds;
