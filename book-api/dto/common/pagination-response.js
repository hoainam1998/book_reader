const { Expose, Type } = require('class-transformer');

class PaginationResponse {
  @Expose({ toClassOnly: true })
  @Type(() => Array)
  list;

  @Expose({ toClassOnly: true })
  @Type(() => Number)
  total;
}

module.exports = PaginationResponse;
