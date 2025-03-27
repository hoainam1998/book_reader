const { Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class BookCreated extends OutputValidate {
  @Type(() => String)
  message;

  @Type(() => String)
  bookId;
}

module.exports = BookCreated;
