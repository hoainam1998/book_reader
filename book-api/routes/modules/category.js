const Router = require('../router');
const CategoryRoutePath = require('#services/route-paths/category');
const { validateResultExecute, upload, validation, serializer } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const authentication = require('#middlewares/auth/authentication');
const { CategoryPagination, CategoryValidator, CategoryDeleteParamsValidator } = require('#dto/category/category-in');
const {
  CategoryPaginationResponse,
  CategoryDetailResponse,
  AllCategoryResponse,
} = require('#dto/category/category-out');
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
    this.post(CategoryRoutePath.all, authentication, this._getAll);
    this.post(CategoryRoutePath.create, authentication, this._create);
    this.put(CategoryRoutePath.update, authentication, this._update);
    this.post(CategoryRoutePath.detail, authentication, this._getDetail);
    this.delete(CategoryRoutePath.delete, authentication, this._delete);
    this.post(CategoryRoutePath.pagination, authentication, this._pagination);
    this.post(CategoryRoutePath.menu, authentication, this._getAll);
  }

  @validation(AllCategory, { error_message: CATEGORY.LOAD_CATEGORIES_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AllCategoryResponse)
  _getAll(req, res, next, self) {
    const query = `query AllCategory($haveValue: Boolean!) {
      category {
        all (haveValue: $haveValue) ${req.body.query}
      }
    }`;
    return self.execute(
      query,
      {
        haveValue: req.path === '/menu',
      },
      req.body.query
    );
  }

  @validation(CategoryPagination, { error_message: CATEGORY.LOAD_CATEGORIES_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(CategoryPaginationResponse)
  _pagination(req, res, next, self) {
    const query = `query CategoryPagination($pageSize: Int!, $pageNumber: Int!) {
      category {
        pagination (pageSize: $pageSize, pageNumber: $pageNumber) {
          list ${req.body.query},
          total,
          page,
          pageSize,
          pages
        }
      }
    }`;

    return self.execute(
      query,
      {
        pageNumber: req.body.pageNumber,
        pageSize: req.body.pageSize,
      },
      req.body.query
    );
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(CategoryValidator, { error_message: CATEGORY.CREATE_CATEGORY_FAIL, groups: ['create'] })
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
      avatar: req.body.avatar,
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
      avatar: req.body.avatar,
    };
    return self.execute(query, { category: variables });
  }

  @validation(CategoryDetailValidator, { error_message: CATEGORY.LOAD_CATEGORY_DETAIL_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(CategoryDetailResponse)
  _getDetail(req, res, next, self) {
    const query = `query CategoryDetail($categoryId: ID!) {
      category {
        detail (categoryId: $categoryId) ${req.body.query}
      }
    }`;
    return self.execute(query, { categoryId: req.body.categoryId }, req.body.query);
  }

  @validation(CategoryDeleteParamsValidator, {
    error_message: CATEGORY.DELETE_CATEGORY_FAIL,
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM,
  })
  @validateResultExecute(HTTP_CODE.OK)
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
