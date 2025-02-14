const { Validator } = require('#services/validator.js');
const {
  IsPositive,
  IsRangeContain,
  IsString,
  IsPassword,
  IsEmail,
  IsObject,
  IsNumeric,
  IsGraphqlSelect,
  IsOptional,
  IsBoolean,
  IsBase64Image,
  IsId,
  Length
} = require('#decorators/validators');
const { classCreator, Validation } = require('../helper.js');

const UserPaginationValidateClass = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsRangeContain([10, 30, 50], 'Page size must in [10, 30, 50]!'),
      IsPositive('Page size must be positive number!'),
    )
    pageSize;

    @validators(
      IsOptional(),
      IsString('keyword must be string!')
    )
    keyword;

    @validators(
      IsPositive('Page number must be positive number!')
    )
    pageNumber;

    @validators(
      IsObject('Query must be object!'),
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const LoginValidateClass = (validators, className) => {
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
      IsObject('Query must be object!'),
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const OtpVerify = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsEmail('Invalid email!'),
    )
    email;

    @validators(
      IsString('Otp must be string!'),
      Length(6, 'Otp must have six character!'),
      IsNumeric('All otp character must be number!')
    )
    otp;

    @validators(
      IsObject('Query must be object!'),
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const OtpUpdate = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsEmail('Invalid email!'),
    )
    email;

    @validators(
      IsObject('Query must be object!'),
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const MfaUpdate = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('categoryId must be numeric string and contain 13 character')
    )
    userId;

    @validators(
      IsBoolean('mfaEnable must be boolean!')
    )
    mfaEnable;
  }, className);
};

const UserDetail = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('categoryId must be numeric string and contain 13 character')
    )
    userId;

    @validators(
      IsObject('Query must be object!'),
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const UserUpdate = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('categoryId must be numeric string and contain 13 character', { groups: ['update'] })
    )
    userId;

    @validators(
      IsString('userId must be string!'),
    )
    firstName;

    @validators(
      IsString('userId must be string!'),
    )
    lastName;

    @validators(
      IsEmail('Invalid email!'),
    )
    email;

    @validators(
      IsBase64Image('avatar must be image!')
    )
    avatar;

    @validators(
      IsBoolean('mfa must be boolean!', { groups: ['update', 'create'] })
    )
    mfa;

    @validators(
      IsPassword('Invalid password!', { groups: ['update_person'] }),
    )
    password;
  }, className);
};

const UserDelete = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('categoryId must be numeric string and contain 13 character')
    )
    id;
  }, className);
};

module.exports = {
  UserPaginationInput: Validation('UserPaginationInput', UserPaginationValidateClass),
  Login: Validation('Login', LoginValidateClass),
  OtpVerify: Validation(OtpVerify),
  OtpUpdate: Validation(OtpUpdate),
  MfaUpdate: Validation(MfaUpdate),
  UserDetail: Validation(UserDetail),
  UserUpdate: Validation(UserUpdate),
  UserDelete: Validation(UserDelete),
};
