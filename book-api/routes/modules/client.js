const Router = require('../router.js');
const { sign } = require('jsonwebtoken');
const { validateResultExecute, upload, validation, serializer } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const { messageCreator, fetchHelper, getOriginInternalServerUrl } = require('#utils');
const { SignUp, ForgetPassword } = require('#dto/client/client-in.js');
const MessageSerializerResponse = require('#dto/common/message-serializer-response.js');
const EmailService = require('#services/email.js');

class ClientRouter extends Router {
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post('/sign-up', this._signup);
    this.post('/forget-password', this._forgetPassword);
    this.post('/generated-reset-password-token', this._generatedResetPassword);
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

  @validation(ForgetPassword, { error_message: 'Request to reset password failed!' })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _generatedResetPassword(req, res, next, self) {
    const query = `mutation ForgetPassword ($email: String!, $passwordResetToken: String!, $passwordResetExpires: Float!) {
      client {
        forgetPassword(email: $email, passwordResetToken: $passwordResetToken, passwordResetExpires: $passwordResetExpires) {
          message
        }
      }
    }`;

    return self.execute(query, {
      email: req.body.email,
      passwordResetToken: req.body.resetToken,
      passwordResetExpires: req.body.expires,
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _forgetPassword(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);
    const resetToken = sign({ email: req.body.email }, process.env.CLIENT_RESET_PASSWORD_SECRET_KEY);

    req.body = {
      ...req.body,
      expires: Date.now() + 3600000,
      resetToken,
    };

    return fetchHelper(`${url}/generated-reset-password-token`,
      'POST',
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify(req.body)
    )
    .then(async (response) => {
      if (![HTTP_CODE.OK, HTTP_CODE.CREATED].includes(response.status)) {
        const json = await response.json();
        return Promise.reject({ ...json, status: response.status });
      }
      return response.json();
    })
    .then((json) => {
      const link = `${process.env.ORIGIN_CORS}?token=${resetToken}`;
      return EmailService.sendResetPasswordEmail(req.body.email, link)
        .then(() => messageCreator(json.message));
    });
  }
}

module.exports = ClientRouter;
