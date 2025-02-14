const Router = require('../router');
const { validateResultExecute, upload, serializer, validation } = require('#decorators');
const authentication = require('#middlewares/auth/authentication.js');
const MessageSerializerResponse = require('#dto/common/message-serializer-response.js');
const { AuthorCreate } = require('#dto/author/author-in.js');
const { HTTP_CODE, UPLOAD_MODE } = require('#constants');

class AuthorRouter extends Router {

  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post('/create-author', authentication, this.createAuthor);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(AuthorCreate, { error_message: 'Create author was failed!', groups: ['create'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  createAuthor(req, res, next, self) {
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
}

module.exports = AuthorRouter;
