const Router = require('../router.js');
const { genSalt, hash } = require('bcrypt');
const { validateResultExecute, upload, validation, serializer } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const { SignUp } = require('#dto/client/client-in.js');
const MessageSerializerResponse = require('#dto/common/message-serializer-response.js');

class ClientRouter extends Router {
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post('/sign-up', this._signup);
  }

  @validation(SignUp, { error_message: 'Sign up was failed!' })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _signup(req, res, next, self) {
    const query = `mutation SignUp ($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
      client {
        signup(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
          message
        }
      }
    }`;

    return self.execute(query, req.body);
  }
}

module.exports = ClientRouter;
