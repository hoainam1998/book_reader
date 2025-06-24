const { classCreator, Validation } = require('../helper.js');
const { Validator } = require('#services/validator');
const {
  IsString,
  IsOptional,
  IsGraphqlSelect,
  IsPositive,
  IsRangeContain,
  IsNumeric,
  Length,
  IsId,
  IsIds,
  IsBase64Image,
  IsMulterFile,
  IsArray,
  IsObject,
} = require('#decorators/validators');

const BookPagination = (validators, className) => {
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

    @validators(
      IsOptional(),
      IsObject('by must be object')
    )
    by;
  }, className);
};

const AllBooks = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const BookCreate = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('bookId must be numeric string and contain 13 character')
    )
    bookId;

    @validators(
      IsString('name must be string')
    )
    name;

    @validators(
      IsPositive('publishedTime must be a number')
    )
    publishedTime;

    @validators(
      IsString('publishedDay must be string!'),
      IsNumeric('publishedDay must be numeric!'),
      Length(13, 'publishedDay must have 13 character!')
    )
    publishedDay;

    @validators(
      IsId('categoryId must be numeric string and contains 13 character')
    )
    categoryId;

    @validators(
      IsBase64Image('avatar must be files!')
    )
    avatar;

    @validators(
      IsArray('string', 'images must be an array!'),
      IsBase64Image('images must be files!'),
    )
    images;

    @validators(
      IsArray('string', 'imageNames must be an array!', { allowedOneElement: 'imagesName must be a string!' }),
    )
    imageNames;
  }, className);
};

const PdfFileSaved = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('bookId must be numeric string and contain 13 character')
    )
    bookId;

    @validators(
      IsString('name must be string')
    )
    name;

    @validators(
      IsString('pdf must be string!')
    )
    pdf;
  }, className);
};

const BookSave = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('bookId must be numeric string and contain 13 character', { groups: 'update' })
    )
    bookId;

    @validators(
      IsString('name must be string')
    )
    name;

    @validators(
      IsPositive('publishedTime must be a number')
    )
    publishedTime;

    @validators(
      IsString('publishedDay must be string!'),
      IsNumeric('publishedDay must be numeric!'),
      Length(13, 'publishedDay must have 13 character!')
    )
    publishedDay;

    @validators(
      IsId('categoryId must be numeric string and contains 13 character')
    )
    categoryId;

    @validators(
      IsIds('authors must be an id or an id array!')
    )
    authors;
  }, className);
};

const BookFileCreated = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsMulterFile('pdf must be files!')
    )
    pdf;

    @validators(
      IsMulterFile('avatar must be files!')
    )
    avatar;

    @validators(
      IsArray('object', 'images must be an array!'),
      IsMulterFile('images must be files!'),
    )
    images;
  }, className);
};

const BookDetail = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('bookId must be numeric string and contain 13 character')
    )
    bookId;

    @validators(
      IsGraphqlSelect('Value of field must be boolean!')
    )
    query;
  }, className);
};

const IntroduceHTMLFileSave = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsId('bookId must be numeric string and contain 13 character')
    )
    bookId;

    @validators(
      IsString('html must be a string!')
    )
    html;

    @validators(
      IsString('json must be a string!')
    )
    json;

    @validators(
      IsString('fileName must be a string!')
    )
    fileName;
  }, className);
};

const BookAuthors = (validators, className) => {
  return classCreator(class extends Validator {
    @validators(
      IsArray('object', 'authors must be an array!'),
    )
    authors;
  }, className);
};

module.exports = {
  BookPagination: Validation(BookPagination),
  BookCreate: Validation(BookCreate),
  BookSave: Validation(BookSave),
  BookFileCreated: Validation(BookFileCreated),
  PdfFileSaved: Validation(PdfFileSaved),
  BookDetail: Validation(BookDetail),
  IntroduceHTMLFileSave: Validation(IntroduceHTMLFileSave),
  BookAuthors: Validation(BookAuthors),
  AllBooks: Validation(AllBooks),
};
