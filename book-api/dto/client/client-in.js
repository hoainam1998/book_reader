const { classCreator, Validation } = require('../helper.js');
const { Validator } = require('#services/validator.js');
const { IsString, IsEmail, IsPassword } = require('#decorators/validators');

const SignUp = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsString('firstName must be a string!')
    )
    firstName;

    @validators(
      IsString('firstName must be a string!')
    )
    lastName;

    @validators(
      IsEmail('firstName must be a string!')
    )
    email;

    @validators(
      IsPassword('Invalid password!'),
    )
    password;
  }, className);
};

module.exports = {
  SignUp: Validation(SignUp)
};
