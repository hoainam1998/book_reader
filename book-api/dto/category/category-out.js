const { Expose, Type } = require('class-transformer');
const { getGraphqlFinalData } = require('#utils');
const { zodValidateClassWrapper } = require('#decorators');
const GraphqlResponse = require('#dto/common/graphql-response');
const CategoryDTO = require('#dto/category/category');
const PaginationResponse = require('#dto/common/pagination-response');

class CategoryPaginationResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => PaginationResponse)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class CategoryDetailResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => CategoryDTO)
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

class AllCategoryResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => [CategoryDTO])
  get response() {
    return getGraphqlFinalData(this.data);
  }
}

module.exports = {
  CategoryPaginationResponse: zodValidateClassWrapper(CategoryPaginationResponse, PaginationResponse),
  CategoryDetailResponse: zodValidateClassWrapper(CategoryDetailResponse, CategoryDTO),
  AllCategoryResponse: zodValidateClassWrapper(AllCategoryResponse, CategoryDTO),
};
