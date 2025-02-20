const Router = require('../router');
const { validateResultExecute, upload, serializer, validation } = require('#decorators');
const authentication = require('#middlewares/auth/authentication.js');
const MessageSerializerResponse = require('#dto/common/message-serializer-response.js');
const { AuthorPaginationResponse } = require('#dto/author/author-out.js');
const { AuthorCreate, AuthorPagination } = require('#dto/author/author-in.js');
const { HTTP_CODE, UPLOAD_MODE } = require('#constants');

/**
 * Organize author routes.
 * @extends Router
 */
class AuthorRouter extends Router {
  /**
  * Create authorRouter instance.
  *
  * @param {object} express - The express object.
  * @param {object} graphqlExecute - The graphql execute instance.
  */
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post('/create-author', authentication, this._createAuthor);
    this.post('/pagination', authentication, this._pagination);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(AuthorCreate, { error_message: 'Create author was failed!', groups: ['create'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _createAuthor(req, res, next, self) {
    const query = `mutation CreateAuthor($author: AuthorInformation!) {
      author {
        create(author: $author) {
          message
        }
      }
    }`;
    return self.execute(query, {
      author: {
        authorId: Date.now().toString(),
        name: req.body.name,
        sex: +req.body.sex,
        avatar: req.body.avatar,
        yearOfBirth: +req.body.yearOfBirth,
        yearOfDead: +req.body.yearOfDead,
        story: {
          html: req.body.storyHtml,
          json: req.body.storyJson
        }
      }
    });
  }

  @validation(AuthorPagination, { error_message: 'Load authors failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AuthorPaginationResponse)
  _pagination(req, res, next, self) {
    const query = `query AuthorPagination($pageSize: Int!, $pageNumber: Int!, $keyword: String) {
      author {
        pagination(pageSize: $pageSize, pageNumber: $pageNumber, keyword: $keyword) {
          list ${
            req.body.query
          },
          total
        }
      }
    }`;
    return self.execute(query,
    {
      pageSize: req.body.pageSize,
      pageNumber: req.body.pageNumber,
      keyword: req.body.keyword
    },
    req.body.query)
  }
}

module.exports = AuthorRouter;
