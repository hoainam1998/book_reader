const { classCreator, Validation } = require('../helper.js');
const { Validator } = require('#services/validator.js');
const { IsString, IsEmail, IsPassword, IsPositive } = require('#decorators/validators');

const SignUp = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsString('firstName must be a string!')
    )
    firstName;

    @validators(
      IsString('lastName must be a string!')
    )
    lastName;

    @validators(
      IsEmail('email must be an email!')
    )
    email;

    @validators(
      IsPassword('Invalid password!'),
    )
    password;
  }, className);
};

const ForgetPassword = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsEmail('firstName must be an email!')
    )
    email;

    @validators(
      IsString('resetToken must be a string!')
    )
    resetToken;

    @validators(
      IsPositive('expires must be a number!')
    )
    expires;
  }, className);
};

module.exports = {
  SignUp: Validation(SignUp),
  ForgetPassword: Validation(ForgetPassword),
};
