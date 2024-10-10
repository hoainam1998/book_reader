const Router = require('../router.js');
const { execute } = require('graphql');
const { validateQuery, validateResultExecute, upload } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE } = require('#constants');
const loginRequire = require('#auth/login-require');

class CategoryRouter extends Router {

  constructor(express, schema) {
    super(express, schema);
    this.post('/all', loginRequire, this._getAll);
    this.post('/create', loginRequire, this._create);
    this.post('/update', loginRequire, this._update);
    this.post('/detail', loginRequire, this._getDetail);
    this.post('/delete', loginRequire, this._delete);
    this.post('/pagination', loginRequire, this._pagination);
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _getAll(req, res, next, schema) {
    return execute({ schema, document: req.body.query });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _pagination(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues:
      {
        pageNumber: req.body.pageNumber,
        pageSize: req.body.pageSize
      }
    });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _create(req, res, next, schema) {
    const variables = {
      categoryId: Date.now(),
      name: req.body.name,
      avatar: req.body.avatar
    };
    return execute({ schema, document: req.body.query, variableValues: { category: variables } });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _update(req, res, next, schema) {
    const variables = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      avatar: req.body.avatar
    };
    return execute({ schema, document: req.body.query, variableValues: { category: variables } });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _getDetail(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: { categoryId: req.body.categoryId } });
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _delete(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: { categoryId: req.body.categoryId } });
  }
}

module.exports = CategoryRouter;
