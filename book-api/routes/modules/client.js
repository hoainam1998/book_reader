const Router = require('../router');
const { validateResultExecute, upload, validation, serializer } = require('#decorators');
const allowInternalCall = require('#middlewares/only-allow-internal-call');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE, METHOD, CLIENT_RESET_PASSWORD_URL } = require('#constants');
const { READER, COMMON } = require('#messages');
const { messageCreator, fetchHelper, getOriginInternalServerUrl, verifyClientResetPasswordToken } = require('#utils');
const { SignUp, ForgetPassword, ResetPassword } = require('#dto/client/client-in');
const Login = require('#dto/common/login-validator');
const { ClientDetailResponse } = require('#dto/client/client-out');
const MessageSerializerResponse = require('#dto/common/message-serializer-response');
const EmailService = require('#services/email');

/**
 * Organize client routes.
 * @class
 * @extends Router
 */
class ClientRouter extends Router {
  /**
  * Create client routes instance.
  *
  * @param {Object} express - The express object.
  * @param {Object} graphqlExecute - The graphql execute instance.
  */
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post('/sign-up', this._signup);
    this.post('/forget-password', this._forgetPassword);
    this.post('/generated-reset-password-token', allowInternalCall, this._generatedResetPassword);
    this.post('/reset-password', this._resetPassword);
    this.post('/login', this._login);
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

  @validation(ForgetPassword, { error_message: READER.GENERATE_RESET_PASSWORD_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _generatedResetPassword(req, res, next, self) {
    const query = `mutation ForgetPassword ($email: String!) {
      client {
        forgetPassword(email: $email) {
          message,
          password,
          resetPasswordToken
        }
      }
    }`;

    return self.execute(query, {
      email: req.body.email,
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _forgetPassword(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(`${url}/generated-reset-password-token`,
      METHOD.POST,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify(req.body)
    )
    .then(async (response) => {
      if (HTTP_CODE.OK !== response.status) {
        const json = await response.json();
        return Promise.reject({ ...json, status: response.status });
      }
      return response.json();
    })
    .then((json) => {
      const { resetPasswordToken, message, password } = json;
      const link = CLIENT_RESET_PASSWORD_URL.format(resetPasswordToken);
      return EmailService.sendPassword(req.body.email, link, password)
        .then(() => messageCreator(message));
    });
  }

  @validation(ResetPassword, { error_message: 'Reset password failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _resetPassword(req, res, next, self) {
    const query = `mutation ResetPassword($token: String!, $email: String!, $password: String!) {
      client {
        resetPassword(token: $token, email: $email, password: $password) {
          message
        }
      }
    }`;

    try {
      const decodedClient = verifyClientResetPasswordToken(req.body.token);
      if (decodedClient.email !== req.body.email) {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator('Register email is not match!')
        };
      }
    } catch (err) {
      if (err.message === 'jwt expired') {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator('Reset password token have been expired time!')
        };
      } else if (err.message === 'invalid signature') {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator('Token is invalid!')
        };
      }
      throw err;
    }

    return self.execute(query, {
      email: req.body.email,
      token: req.body.token,
      password: req.body.password,
    });
  }

  @validation(Login, { error_message: 'Login was failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(ClientDetailResponse)
  _login(req, res, nest, self) {
    const query = `query Login($email: String!, $password: String!) {
      client {
        login(email: $email, password: $password) ${
          req.body.query
        }
      }
    }`;

    return self.execute(query, {
      email: req.body.email,
      password: req.body.password,
    }, req.body.query);
  }
}

module.exports = ClientRouter;
