const { validate, validating } = require('../helpers');

const isString = validate((value) => typeof value === 'string');

const IsString = validating(isString);

module.exports = IsString;
