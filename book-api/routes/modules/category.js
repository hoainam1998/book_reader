const Router = require('../router');
const { validateResultExecute, upload, validation, serializer } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const authentication = require('#middlewares/auth/authentication');
const { CategoryPagination, CategoryValidator, CategoryDeleteParamsValidator } = require('#dto/category/category-in');
const { CategoryPaginationResponse, CategoryDetailResponse, AllCategoryResponse } = require('#dto/category/category-out');
const { CategoryDetailValidator, AllCategory } = require('#dto/category/category-in');
const MessageSerializerResponse = require('#dto/common/message-serializer-response');
const { CATEGORY } = require('#messages');

/**
 * Organize category routes.
 * @class
 * @extends Router
 */
class CategoryRouter extends Router {
  /**
  * Create categoryRouter instance.
  *
  * @param {Object} express - The express object.
  * @param {Object} graphqlExecute - The graphql execute instance.
  */
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post('/all', authentication, this._getAll);
    this.post('/create', authentication, this._create);
    this.put('/update', authentication, this._update);
    this.post('/detail', authentication, this._getDetail);
    this.delete('/delete/:id', authentication, this._delete);
    this.post('/pagination', authentication, this._pagination);
  }

  @validation(AllCategory, { error_message: 'Load all categories failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AllCategoryResponse)
  _getAll(req, res, next, self) {
    const query = `query AllCategory {
      category {
        all ${
          req.body.query
        }
      }
    }`;
    return self.execute(query, undefined, req.body.query);
  }

  @validation(CategoryPagination, { error_message: 'Load categories failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(CategoryPaginationResponse)
  _pagination(req, res, next, self) {
    const query = `query CategoryPagination($pageSize: Int!, $pageNumber: Int!) {
      category {
        pagination (pageSize: $pageSize, pageNumber: $pageNumber) {
          list ${
            req.body.query
          },
          total
        }
      }
    }`;

    return self.execute(query,
      {
        pageNumber: req.body.pageNumber,
        pageSize: req.body.pageSize
      },
      req.body.query
    );
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(CategoryValidator, { error_message: CATEGORY.CREATE_CATEGORY_FAIL , groups: ['create'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _create(req, res, next, self) {
    const query = `mutation CreateCategory($category: CategoryInput!) {
      category {
        create (category: $category) {
          message
        }
      }
    }`;
    const variables = {
      name: req.body.name,
      avatar: req.body.avatar
    };
    return self.execute(query, { category: variables });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(CategoryValidator, { error_message: CATEGORY.UPDATE_CATEGORY_FAIL, groups: ['update'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _update(req, res, next, self) {
    const query = `mutation UpdateCategory($category: CategoryInput!) {
      category {
        update (category: $category) {
          message
        }
      }
    }`;
    const variables = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      avatar: req.body.avatar
    };
    return self.execute(query, { category: variables });
  }

  @validation(CategoryDetailValidator, { error_message: CATEGORY.LOAD_CATEGORY_DETAIL_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(CategoryDetailResponse)
  _getDetail(req, res, next, self) {
    const query = `query CategoryDetail($categoryId: ID!) {
      category {
        detail (categoryId: $categoryId) ${
          req.body.query
        }
      }
    }`;
    return self.execute(query, { categoryId: req.body.categoryId }, req.body.query);
  }

  @validation(CategoryDeleteParamsValidator, { request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _delete(req, res, next, self) {
    const query = `query DeleteCategory($categoryId: ID!) {
      category {
        delete (categoryId: $categoryId) {
          message
        }
      }
    }`;
    return self.execute(query, { categoryId: req.params.id });
  }
}

module.exports = CategoryRouter;
