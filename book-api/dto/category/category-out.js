const { getGraphqlFinalData } = require('#utils');
const GraphqlResponse = require('#dto/common/graphql-response.js');
const { CategoriesDTO, CategoryDTO } = require('#dto/category/category.js');
const { Expose, Type } = require('class-transformer');

class CategoryPaginationResponse extends GraphqlResponse {
  @Expose({ toClassOnly: true })
  @Type(() => CategoriesDTO)
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
  CategoryPaginationResponse,
  CategoryDetailResponse,
  AllCategoryResponse,
};
