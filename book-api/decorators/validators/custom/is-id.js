const { validate, validating } = require('../helpers.js');

const isId = validate((value) => {
  return /^([0-9])+$/.test(value) && typeof value === 'string' && value.length === 13;
});

const IsId = validating(isId);

module.exports = IsId;
