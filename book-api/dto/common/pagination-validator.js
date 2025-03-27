const { Validator } = require('#services/validator');
const { classCreator, Validation } = require('../helper.js');
const {
  IsPositive,
  IsRangeContain,
  IsGraphqlSelect,
} = require('#decorators/validators');

const PaginationValidator = (validators, className) => {
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
  }, className);
};

module.exports = Validation(PaginationValidator);
