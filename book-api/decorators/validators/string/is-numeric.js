const { validate, validating } = require('#helpers');

const isNumeric = validate((value) => /^([0-9])+$/.test(value));

const IsNumeric = validating(isNumeric);

module.exports = IsNumeric;
