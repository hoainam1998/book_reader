const Router = require('../router');
const { validateQuery, validateResultExecute, upload } = require('#decorators');
const { HTTP_CODE, UPLOAD_MODE } = require('#constants');
const { execute } = require('graphql');

class AuthorRouter extends Router {

  constructor(express, schema) {
    super(express, schema);
    this.post('/create-author', this.createAuthor);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  createAuthor(req, res, next, schema) {
    return execute({ schema, document: req.body.query, variableValues: {
        author: {
          authorId: Date.now().toString(),
          name: req.body.name,
          sex: +req.body.sex,
          avatar: req.body.avatar,
          yearOfBirth: +req.body.yearOfBirth,
          yearOfDead: +req.body.yearOfDead,
          story: {
            html: req.body.story_html,
            json: req.body.story_json
          }
        }
      }
    });
  }
}

module.exports = AuthorRouter;
