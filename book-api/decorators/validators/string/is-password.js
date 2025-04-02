const { validate, validating } = require('#helpers');

const passwordPattern = /[A-Za-z0-9@$#%^&*()]{8}/;

const isPassword = validate((value) => typeof value === 'string' && passwordPattern.test(value));

const IsPassword = validating(isPassword);

module.exports = IsPassword;
