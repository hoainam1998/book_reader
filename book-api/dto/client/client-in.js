const { classCreator, Validation } = require('../helper.js');
const { Validator } = require('#services/validator');
const {
  IsId,
  IsString,
  IsEmail,
  IsPassword,
  IsNumeric,
  IsGraphqlSelect,
  IsBase64Image,
  IsOptional,
  Length,
  IsRangeContain,
  IsPositive,
} = require('#decorators/validators');
const { SEX } = require('#constants');

const validSex = Object.values(SEX);

const ClientPagination = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(
        IsRangeContain([10, 30, 50], 'Page size must in [10, 30, 50]!'),
        IsPositive('Page size must be positive number!')
      )
      pageSize;

      @validators(IsOptional(), IsString('keyword must be string!'))
      keyword;

      @validators(IsPositive('Page number must be positive number!'))
      pageNumber;

      @validators(IsGraphqlSelect('Value of field must be boolean!'))
      query;
    },
    className
  );
};

const BlockClient = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(IsId('clientId must be numeric string and contain 13 character'))
      clientId;
    },
    className
  );
};

const AllClient = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(IsOptional(), IsId('clientId must be numeric string and contain 13 character'))
      exclude;

      @validators(IsGraphqlSelect('Value of field must be boolean!'))
      query;
    },
    className
  );
};

const ClientUpdate = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(IsId('clientId must be numeric string and contain 13 character', { groups: ['update'] }))
      userId;

      @validators(IsString('firstName must be string!'))
      firstName;

      @validators(IsString('lastName must be string!'))
      lastName;

      @validators(IsEmail('Invalid email!'))
      email;

      @validators(
        IsNumeric('sex must be a numeric!'),
        IsRangeContain(validSex, 'sex must in [0, 1]!')
      )
      sex;

      @validators(IsBase64Image('avatar must be image!'))
      avatar;

      @validators(
        Length(10, 'phone number must contain 10 character!'),
        IsString('phone number must be a string!'),
        IsNumeric('phone number must be numeric!')
      )
      phone;
    },
    className
  );
};

const ClientDetail = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(IsGraphqlSelect('value of field must be boolean!'))
      query;
    },
    className
  );
};

const SignUp = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(IsString('firstName must be a string!'))
      firstName;

      @validators(IsString('lastName must be a string!'))
      lastName;

      @validators(IsEmail('email must be an email!'))
      email;

      @validators(IsPassword('Invalid password!'))
      password;

      @validators(
        IsNumeric('sex must be a numeric!'),
        IsRangeContain(validSex, 'sex must in [0, 1]!')
      )
      sex;
    },
    className
  );
};

const ForgetPassword = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(IsEmail('email invalid!'))
      email;
    },
    className
  );
};

const ResetPassword = (validators, className) => {
  return classCreator(
    class extends Validator {
      @validators(IsEmail('email invalid!'))
      email;

      @validators(IsString('token must be a string!'))
      resetPasswordToken;

      @validators(IsPassword('Invalid password!'))
      oldPassword;

      @validators(IsPassword('Invalid password!'))
      password;
    },
    className
  );
};

module.exports = {
  SignUp: Validation(SignUp),
  ForgetPassword: Validation(ForgetPassword),
  ResetPassword: Validation(ResetPassword),
  ClientDetail: Validation(ClientDetail),
  ClientUpdate: Validation(ClientUpdate),
  AllClient: Validation(AllClient),
  ClientPagination: Validation(ClientPagination),
  BlockClient: Validation(BlockClient),
};
