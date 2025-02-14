const { validate, validating } = require('../helpers.js');

const isBoolean = validate((value) => {
  if (typeof value === 'string') {
    return value === 'true' || value === 'false';
  }
  return typeof value === 'boolean';
});

const IsBoolean = validating(isBoolean);

module.exports = IsBoolean;
