const Router = require('../router.js');
const { execute } = require('graphql');
const {
  validateQuery,
  validateResultExecute,
  uploadPdf,
} = require('../../decorators/index.js');

class BookRouter extends Router {
  constructor(express, schema) {
    super(express, schema);
  }

  @uploadPdf('pdf')
  @validateResultExecute(201)
  @validateQuery
  _saveIntroduceHtmlFile(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: { html: req.body.html, fileName: req.body.fileName } });
  }
}

module.exports = BookRouter;
