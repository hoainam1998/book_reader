const { classCreator, Validation } = require('../helper.js');
const { Validator } = require('#services/validator.js');
const {
  IsString,
  IsNumeric,
  IsId,
  IsBase64Image,
  IsRangeContain,
  IsPositive,
  IsGraphqlSelect,
  IsOptional,
} = require('#decorators/validators');

const AuthorCreate = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('authorId must be a numeric and contain 13 character!', { groups: ['update'] })
    )
    authorId;

    @validators(
      IsString('name must be a string!')
    )
    name;

    @validators(
      IsNumeric('sex must be a numeric!')
    )
    sex;

    @validators(
      IsBase64Image('avatar must be a base64 string!')
    )
    avatar;

    @validators(
      IsNumeric('yearOfBirth must be a numeric!')
    )
    yearOfBirth;

    @validators(
      IsNumeric('yearOfDead must be a numeric!')
    )
    yearOfDead;

    @validators(
      IsString('storyHtml must be a string!')
    )
    storyHtml;

    @validators(
      IsString('storyJson must be a string!')
    )
    storyJson;
  }, className);
};
const AuthorPagination = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsRangeContain([10, 30, 50], 'Page size must in [10, 30, 50]!'),
      IsPositive('Page size must be positive number!')
    )
    pageSize;

    @validators(
      IsPositive('Page number must be positive number!')
    )
    pageNumber;

    @validators(
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;

    @validators(
      IsOptional(),
      IsString('keyword must be string!')
    )
    keyword;
  }, className);
};

module.exports = {
  AuthorCreate: Validation(AuthorCreate),
  AuthorPagination: Validation(AuthorPagination),
};
