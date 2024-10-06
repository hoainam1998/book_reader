const Router = require('../router.js');
const { execute } = require('graphql');
const { upload, validateQuery, validateResultExecute } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE } = require('#constants');

class UserRouter extends Router {
  constructor(express, schema) {
    super(express, schema);
    this.post('/add', this._addBook);
    this.post('/pagination', this._pagination);
    this.post('/update-mfa', this._updateMfaState);
    this.post('/delete-user', this._deleteUser);
    this.post('/user-detail', this._getUserDetail);
    this.post('/update-user', this._updateUser);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _addBook(req, res, next, schema) {
    const variables = {
      userId: Date.now(),
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      avatar: req.body.avatar,
      mfaEnable: req.body.mfa === 'true'
    };
    return execute({ schema, document: req.body.query, variableValues: { user: variables } });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _pagination(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
      pageSize: req.body.pageSize,
      pageNumber: req.body.pageNumber,
      keyword: req.body.keyword
    }});
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _updateMfaState(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
      userId: req.body.userId,
      mfaEnable: req.body.mfaEnable
    }});
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _deleteUser(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
      userId: req.body.userId
    }});
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _updateUser(req, res, next, schema) {
    const variables = {
      userId: req.body.userId,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      avatar: req.body.avatar,
      mfaEnable: req.body.mfa === 'true'
    };
    return execute({ schema, document: req.body.query, variableValues: { user: variables } });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _getUserDetail(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
      userId: req.body.userId
    }});
  }
}

module.exports = UserRouter;
