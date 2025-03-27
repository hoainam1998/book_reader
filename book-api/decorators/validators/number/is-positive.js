const { validate, validating } = require('#helpers');

const isPositive = validate((value) => {
  if (typeof value === 'string') {
    return !Number.isNaN(value) && parseInt(value) > 0;
  } else if (typeof value === 'number') {
    return value > 0;
  }
  return false;
});

const IsPositive = validating(isPositive);

module.exports = IsPositive;
