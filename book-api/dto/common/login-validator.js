const { Validator } = require('#services/validator.js');
const { classCreator, Validation } = require('../helper.js');
const {
  IsGraphqlSelect,
  IsEmail,
  IsPassword,
} = require('#decorators/validators');

const Login = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsEmail('Invalid email!'),
    )
    email;

    @validators(
      IsPassword('Invalid password!'),
    )
    password;

    @validators(
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

module.exports = Validation(Login);
