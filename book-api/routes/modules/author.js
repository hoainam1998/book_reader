const Router = require('../router');
const { validateResultExecute, upload, serializer, validation } = require('#decorators');
const authentication = require('#middlewares/auth/authentication');
const MessageSerializerResponse = require('#dto/common/message-serializer-response');
const { AuthorPaginationResponse, AuthorDetailResponse, AllAuthorResponse } = require('#dto/author/author-out');
const { AuthorSave, AuthorPagination, AuthorDetail, AuthorFilter } = require('#dto/author/author-in');
const { HTTP_CODE, UPLOAD_MODE } = require('#constants');
const { AUTHOR } = require('#messages');

/**
 * Organize author routes.
 * @class
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
    this.post('/create', authentication, this._createAuthor);
    this.post('/pagination', authentication, this._pagination);
    this.post('/detail', authentication, this._getAuthorDetail);
    this.put('/update', authentication, this._updateAuthor);
    this.post('/filter', authentication, this._getAuthors);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(AuthorSave, { error_message: AUTHOR.CREATE_AUTHOR_FAIL, groups: ['create'] })
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

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(AuthorSave, { error_message: 'Updating author failed!', groups: ['update'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateAuthor(req, res, next, self) {
    const query = `mutation UpdateAuthor($author: AuthorInformation!) {
      author {
        update(author: $author) {
          message
        }
      }
    }`;

    return self.execute(query, {
      author: {
        authorId: req.body.authorId,
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

  @validation(AuthorDetail, { error_message: 'Getting author details failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AuthorDetailResponse)
  _getAuthorDetail(req, res, next, self) {
    const query = `query AuthorDetail($authorId: ID!) {
      author {
        detail(authorId: $authorId) ${
          req.body.query
        }
      }
    }`;

    return self.execute(query,
    { authorId: req.body.authorId },
    req.body.query);
  }

  @validation(AuthorPagination, { error_message: 'Loading authors information failed!' })
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
    req.body.query);
  }

  @validation(AuthorFilter, { error_message: 'Loading authors failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AllAuthorResponse)
  _getAuthors(req, res, next, self) {
    const query = `query AllAuthor($authorIds: [String]) {
      author {
        filter(authorIds: $authorIds) ${
          req.body.query
        }
      }
    }`;

    return self.execute(
      query,
      { authorIds: req.body.authorIds },
      req.body.query
    );
  }
}

module.exports = AuthorRouter;
