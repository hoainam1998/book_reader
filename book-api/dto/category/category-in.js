const { classCreator, Validation } = require('../helper.js');
const { Validator } = require('#services/validator.js');
const {
  IsString,
  IsBase64Image,
  IsObject,
  IsGraphqlSelect,
  IsId,
} = require('#decorators/validators');
const PaginationValidator = require('../common/pagination-validator.js');

const CategoryValidator = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('categoryId must be numeric string and contain 13 character', { groups: ['update'] })
    )
    categoryId;

    @validators(
      IsString('name must be string!')
    )
    name;

    @validators(
      IsBase64Image('avatar must be image!')
    )
    avatar;
  }, className);
};

const CategoryDetailValidator = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('categoryId must be numeric string and contain 13 character')
    )
    categoryId;

    @validators(
      IsObject('Query must be object!'),
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const CategoryDeleteParamsValidator = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('categoryId must be numeric string and contain 13 character')
    )
    id;
  }, className);
};

const AllCategory = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsObject('Query must be object!'),
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

module.exports = {
  CategoryPagination: PaginationValidator,
  CategoryValidator: Validation(CategoryValidator),
  CategoryDeleteParamsValidator: Validation(CategoryDeleteParamsValidator),
  CategoryDetailValidator: Validation(CategoryDetailValidator),
  AllCategory: Validation(AllCategory),
};
