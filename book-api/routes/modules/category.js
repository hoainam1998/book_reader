const Router = require('../router.js');
const { execute } = require('graphql');
const { validateQuery, validateResultExecute, upload } = require('../../decorators/index.js');
const { UPLOAD_MODE } = require('../../constants/index.js');

class CategoryRouter extends Router {

  constructor(express, schema) {
    super(express, schema);
    this.post('/all', this._getAll);
    this.post('/create', this._create);
    this.post('/update', this._update);
    this.post('/detail', this._getDetail);
    this.post('/delete', this._delete);
    this.post('/pagination', this._pagination);
  }

  get Router() {
    return this._router;
  }

  @validateResultExecute(200)
  @validateQuery
  _getAll(req, res, next, schema) {
    return execute({ schema, document: req.body.query });
  }

  @validateResultExecute(200)
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
  @validateResultExecute(201)
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
  @validateResultExecute(201)
  @validateQuery
  _update(req, res, next, schema) {
    const variables = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      avatar: req.body.avatar
    };
    return execute({ schema, document: req.body.query, variableValues: { category: variables } });
  }

  @validateResultExecute(200)
  @validateQuery
  _getDetail(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: { categoryId: req.body.categoryId } });
  }

  @validateResultExecute(201)
  @validateQuery
  _delete(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: { categoryId: req.body.categoryId } });
  }
}

module.exports = CategoryRouter;
