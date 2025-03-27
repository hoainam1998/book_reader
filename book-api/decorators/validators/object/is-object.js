const { validate, validating } = require('#helpers');

const isObject = validate((value) => typeof value === 'object');

const IsObject = validating(isObject);

module.exports = IsObject;
