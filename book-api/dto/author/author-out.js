const { Expose, Type } = require('class-transformer');
const PaginationResponse = require('#dto/common/pagination-response');
const GraphqlResponse = require('#dto/common/graphql-response');
const AuthorDetailDTO = require('#dto/author/author-detail');
const AuthorDTO = require('#dto/author/author');
const { getGraphqlFinalData } = require('#utils');
const { zodValidateClassWrapper } = require('#decorators');

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
  AuthorPaginationResponse: zodValidateClassWrapper(AuthorPaginationResponse, PaginationResponse),
  AuthorDetailResponse: zodValidateClassWrapper(AuthorDetailResponse, AuthorDetailDTO),
  AllAuthorResponse: zodValidateClassWrapper(AllAuthorResponse, AuthorDTO),
};
