const { validate, validating } = require('../helpers.js');

const isObject = validate((value) => typeof value === 'object');

const IsObject = validating(isObject);

module.exports = IsObject;
