const { classCreator, Validation } = require('../helper.js');
const { Validator } = require('#services/validator');
const { IsString, IsEmail, IsPassword, IsNumeric } = require('#decorators/validators');

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

    @validators(
      IsNumeric('sex must be a numeric!')
    )
    sex;
  }, className);
};

const ForgetPassword = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsEmail('email invalid!')
    )
    email;
  }, className);
};

const ResetPassword = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsEmail('email invalid!'),
    )
    email;

    @validators(
      IsString('token must be a string!'),
    )
    resetPasswordToken;

    @validators(
      IsPassword('Invalid password!'),
    )
    oldPassword;

    @validators(
      IsPassword('Invalid password!'),
    )
    password;
  }, className);
};

module.exports = {
  SignUp: Validation(SignUp),
  ForgetPassword: Validation(ForgetPassword),
  ResetPassword: Validation(ResetPassword),
};
