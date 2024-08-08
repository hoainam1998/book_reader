const Router = require('../router.js');
const { execute } = require('graphql');
const {
  validateQuery,
  validateResultExecute,
} = require('../../decorators/index.js');

class BookRouter extends Router {
  constructor(express, schema) {
    super(express, schema);
    this.post('/save-introduce', this._saveIntroduceHtmlFile);
  }

  @validateResultExecute(201)
  @validateQuery
  _saveIntroduceHtmlFile(req, res, next, schema) {
    console.log(req.body.fileName, req.body.html);
    return execute({ schema, document: req.body.query, variableValues: {
        introduce: { html: req.body.html, name: req.body.fileName }
      }
    });
  }
}

module.exports = BookRouter;
