const { Expose, Type } = require('class-transformer');
const OutputValidate = require('#services/output-validate');

class PaginationResponse extends OutputValidate {
  @Expose({ toClassOnly: true })
  @Type(() => Array)
  list;

  @Expose({ toClassOnly: true })
  @Type(() => Number)
  total;

  @Expose({ toClassOnly: true })
  @Type(() => Number)
  pageNumber;
}

module.exports = PaginationResponse;
