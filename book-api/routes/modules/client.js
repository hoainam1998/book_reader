const Router = require('../router');
const ErrorCode = require('#services/error-code');
const { validateResultExecute, upload, validation, serializer } = require('#decorators');
const allowInternalCall = require('#middlewares/only-allow-internal-call');
const onlyAllowOneDevice = require('#middlewares/auth/only-use-one-device');
const clientLoginRequire = require('#middlewares/auth/client-login-require');
const authentication = require('#middlewares/auth/authentication');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE, METHOD, RESET_PASSWORD_URL } = require('#constants');
const { READER, USER, COMMON } = require('#messages');
const {
  messageCreator,
  fetchHelper,
  getOriginInternalServerUrl,
  verifyClientResetPasswordToken,
  getGeneratorFunctionData,
} = require('#utils');
const { SignUp, ForgetPassword, ResetPassword, ClientDetail } = require('#dto/client/client-in');
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
    this.post('/sign-up', onlyAllowOneDevice, this._signup);
    this.post('/forget-password', onlyAllowOneDevice, this._forgetPassword);
    this.post('/generated-reset-password-token', allowInternalCall, this._generatedResetPassword);
    this.post('/reset-password', onlyAllowOneDevice, this._resetPassword);
    this.post('/login', onlyAllowOneDevice, this._login);
    this.post('/logout', clientLoginRequire, this._logout);
    this.post('/detail', authentication, this._detail);
  }

  @validation(ClientDetail, { error_message: READER.LOAD_DETAIL_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(ClientDetailResponse)
  _detail(req, res, next, self) {
    const query = `query ClientDetail ($clientId: ID!) {
      client {
        detail(clientId: $clientId) ${
          req.body.query
        }
      }
    }`;

    return self.execute(query, {
      clientId: req.session.client.clientId,
    }, req.body.query);
  }

  @validation(SignUp, { error_message: READER.SIGNUP_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _signup(req, res, next, self) {
    const query = `mutation SignUp ($firstName: String!, $lastName: String!, $email: String!, $password: String!, $sex: Int!) {
      client {
        signup(firstName: $firstName, lastName: $lastName, email: $email, password: $password, sex: $sex) {
          message
        }
      }
    }`;

    return self.execute(query, {
      ...req.body,
      sex: +req.body.sex,
    });
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
      const link = RESET_PASSWORD_URL.format(resetPasswordToken);
      return EmailService.sendPassword(req.body.email, link, password)
        .then(() => messageCreator(message));
    });
  }

  @validation(ResetPassword, { error_message: USER.RESET_PASSWORD_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _resetPassword(req, res, next, self) {
    const query = `mutation ResetPassword($token: String!, $email: String!, $oldPassword: String!, $password: String!) {
      client {
        resetPassword(token: $token, email: $email, oldPassword: $oldPassword, password: $password) {
          message
        }
      }
    }`;

    if (req.body.password === req.body.oldPassword) {
      return {
        status: HTTP_CODE.UNAUTHORIZED,
        json: messageCreator(USER.OLD_AND_NEW_PASSWORD_IS_SAME, ErrorCode.DATA_IS_DUPLICATE)
      };
    }

    try {
      const decodedClient = verifyClientResetPasswordToken(req.body.resetPasswordToken);
      if (decodedClient.email !== req.body.email) {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(COMMON.REGISTER_EMAIL_NOT_MATCH, ErrorCode.CREDENTIAL_NOT_MATCH)
        };
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(COMMON.RESET_PASSWORD_TOKEN_EXPIRE, ErrorCode.TOKEN_EXPIRED)
        };
      } else {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(COMMON.TOKEN_INVALID, ErrorCode.TOKEN_INVALID)
        };
      }
    }

    const promise = self.execute(query, {
      email: req.body.email,
      token: req.body.resetPasswordToken,
      oldPassword: req.body.oldPassword,
      password: req.body.password,
    });

    return getGeneratorFunctionData(promise).then((result) => {
      if (result?.data?.client?.resetPassword?.message) {
        req.session.destroy();
      }
      return result;
    });
  }

  @validation(Login, { error_message: USER.LOGIN_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(ClientDetailResponse)
  _login(req, res, nest, self) {
    if (req.session.client) {
      if (req.body.email === req.session.client.email) {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(USER.ALREADY_LOGIN, ErrorCode.TOKEN_EXPIRED),
        };
      }
    }

    const query = `query Login($email: String!, $password: String!) {
      client {
        login(email: $email, password: $password) ${
          req.body.query
        }
      }
    }`;

    const promise = self.execute(query, {
      email: req.body.email,
      password: req.body.password,
    }, req.body.query);

    return getGeneratorFunctionData(promise).then((result) => {
      const client = result?.data?.client?.login;
      if (client) {
        return self.Service.updateClientSessionId(req.session.id, client.clientId)
          .then(() => {
            req.session.client = {
              clientId: client.clientId,
              email: client.email || req.body.email,
              apiKey: client.apiKey,
            };
            return client;
          });
      }
      return result;
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
   _logout(req, res, next, self) {
    return self.Service.deleteClientSessionId(req.session.client.clientId)
      .then(async () => {
        await req.session.destroy();
        return messageCreator(USER.LOGOUT_SUCCESS);
      });
  }
}

module.exports = ClientRouter;
