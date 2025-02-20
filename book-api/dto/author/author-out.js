const { Expose, Type } = require('class-transformer');
const PaginationResponse = require('#dto/common/pagination-response.js');
const GraphqlResponse = require('#dto/common/graphql-response.js');
const { getGraphqlFinalData } = require('#utils');

class AuthorPaginationResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => PaginationResponse)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  AuthorPaginationResponse
};
