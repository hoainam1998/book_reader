const { validate, validating } = require('#helpers');

// I copy this regex at https://github.com/logaretm/vee-validate/blob/main/packages/rules/src/email.ts
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\\-]*\.)+[A-Z]{2,}$/i;

const isEmail = validate((value) => typeof value === 'string' && emailRegex.test(value));

const IsEmail = validating(isEmail);

module.exports = IsEmail;
