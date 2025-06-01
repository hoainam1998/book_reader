const { REGEX } = require('../../../constants');
const { validate, validating } = require('#helpers');

const isPassword = validate((value) => typeof value === 'string' && REGEX.PASSWORD.test(value));

const IsPassword = validating(isPassword);

module.exports = IsPassword;
