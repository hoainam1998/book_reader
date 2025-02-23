const { Expose, Type } = require('class-transformer');
const PaginationResponse = require('#dto/common/pagination-response.js');
const GraphqlResponse = require('#dto/common/graphql-response.js');
const AuthorDetailDTO = require('#dto/author/author-detail.js');
const AuthorDTO = require('#dto/author/author.js');
const { getGraphqlFinalData } = require('#utils');

class AuthorPaginationResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => PaginationResponse)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class AuthorDetailResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => AuthorDetailDTO)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class AllAuthorResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => [AuthorDTO])
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  AuthorPaginationResponse,
  AuthorDetailResponse,
  AllAuthorResponse,
};
