const Router = require('../router');
const ErrorCode = require('#services/error-code');
const { validateResultExecute, upload, validation, serializer } = require('#decorators');
const allowInternalCall = require('#middlewares/only-allow-internal-call');
const onlyAllowOneDevice = require('#middlewares/auth/only-use-one-device');
const clientLoginRequire = require('#middlewares/auth/client-login-require');
const authentication = require('#middlewares/auth/authentication');
const onlyAdminAllowed = require('#middlewares/auth/only-admin-allowed');
const { UPLOAD_MODE, HTTP_CODE, METHOD, BLOCK, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const { READER, USER, COMMON } = require('#messages');
const {
  messageCreator,
  fetchHelper,
  getOriginInternalServerUrl,
  verifyClientResetPasswordToken,
  getGeneratorFunctionData,
  getClientResetPasswordLink,
} = require('#utils');
const {
  SignUp,
  ForgetPassword,
  ResetPassword,
  ClientDetail,
  ClientUpdate,
  AllClient,
  ClientPagination,
  BlockClient,
} = require('#dto/client/client-in');
const Login = require('#dto/common/login-validator');
const { ClientDetailResponse, AllClientsResponse, ClientPaginationResponse } = require('#dto/client/client-out');
const MessageSerializerResponse = require('#dto/common/message-serializer-response');
const EmailService = require('#services/email');
const ClientRoutePath = require('#services/route-paths/client');

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
    this.post(ClientRoutePath.signUp, onlyAllowOneDevice, this._signup);
    this.post(ClientRoutePath.forgetPassword, onlyAllowOneDevice, this._forgetPassword);
    this.post(ClientRoutePath.generatedResetPasswordToken, allowInternalCall, this._generatedResetPassword);
    this.post(ClientRoutePath.resetPassword, onlyAllowOneDevice, this._resetPassword);
    this.post(ClientRoutePath.login, onlyAllowOneDevice, this._login);
    this.get(ClientRoutePath.logout, clientLoginRequire, this._logout);
    this.post(ClientRoutePath.detail, authentication, this._detail);
    this.put(ClientRoutePath.updatePerson, authentication, this._updateClient);
    this.post(ClientRoutePath.all, authentication, this._getAllClient);
    this.post(ClientRoutePath.pagination, authentication, this._pagination);
    this.put(ClientRoutePath.block, authentication, onlyAdminAllowed, this._blockClient);
    this.put(ClientRoutePath.unblock, authentication, onlyAdminAllowed, this._unBlockClient);
  }

  @validation(BlockClient, {
    error_message: READER.UNBLOCK_CLIENT_FAIL,
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM,
  })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _unBlockClient(req, res, next, self) {
    const query = `mutation BlockClient($clientId: ID!, $state: Int!) {
      client {
        blockClient (clientId: $clientId, state: $state) {
          message
        }
      }
    }`;

    return self.execute(query, { clientId: req.params.clientId, state: BLOCK.OFF });
  }

  @validation(BlockClient, {
    error_message: READER.BLOCK_CLIENT_FAIL,
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM,
  })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _blockClient(req, res, next, self) {
    const query = `mutation BlockClient($clientId: ID!, $state: Int!) {
      client {
        blockClient (clientId: $clientId, state: $state) {
          message
        }
      }
    }`;

    const clientId = req.params.clientId;

    return self.Service.deleteClientSessionId(clientId).then((client) => {
      return new Promise((resolve) => {
        return req.sessionStore.destroy(client.session_id, function () {
          if (self.Socket.Clients.has(clientId)) {
            self.Socket.Clients.get(clientId).send({ delete: true });
          }
          resolve(
            getGeneratorFunctionData(self.execute(query, { clientId, state: BLOCK.ON }))
          );
        });
      });
    });
  }

  @validation(ClientPagination, {
    error_message: READER.PAGINATION_LOAD_CLIENT_FAIL,
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(ClientPaginationResponse)
  _pagination(req, res, next, self) {
    const query = `query ClientPagination($pageSize: Int!, $pageNumber: Int!, $keyword: String) {
      client {
        pagination (pageSize: $pageSize, pageNumber: $pageNumber, keyword: $keyword) {
          list ${req.body.query},
          total,
          page,
          pages,
          pageSize
        }
      }
    }`;

    return self.execute(
      query,
      {
        pageSize: req.body.pageSize,
        pageNumber: req.body.pageNumber,
        keyword: req.body.keyword,
      },
      req.body.query
    );
  }

  @validation(AllClient, { error_message: READER.LOAD_ALL_CLIENT_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AllClientsResponse)
  _getAllClient(req, res, next, self) {
    const query = `query GetAllClient($exclude: ID) {
      client {
        all(exclude: $exclude) ${req.body.query}
      }
    }`;
    return self.execute(query, { exclude: req.body.exclude }, req.body.query);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(ClientUpdate, { error_message: READER.ADD_PERSONAL_INFORMATION_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateClient(req, res, next, self) {
    const variables = {
      clientId: req.session.client.clientId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      sex: +req.body.sex,
      phone: req.body.phone,
      avatar: req.body.avatar,
    };
    const query = `mutation UpdateClient($client: ClientInputType!) {
      client {
        updateClient(client: $client) {
          message
        }
      }
    }`;
    return self.execute(query, { client: variables });
  }

  @validation(ClientDetail, { error_message: READER.LOAD_DETAIL_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(ClientDetailResponse)
  _detail(req, res, next, self) {
    const query = `query ClientDetail ($clientId: ID!) {
      client {
        detail(clientId: $clientId) ${req.body.query}
      }
    }`;

    return self.execute(
      query,
      {
        clientId: req.session.client.clientId,
      },
      req.body.query
    );
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
  _forgetPassword(req) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(
      `${url}/generated-reset-password-token`,
      METHOD.POST,
      {
        'Content-Type': 'application/json',
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
        const link = getClientResetPasswordLink(resetPasswordToken);
        return EmailService.sendPassword(req.body.email, link, password).then(() => messageCreator(message));
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
        json: messageCreator(USER.OLD_AND_NEW_PASSWORD_IS_SAME, ErrorCode.DATA_IS_DUPLICATE),
      };
    }

    try {
      const decodedClient = verifyClientResetPasswordToken(req.body.resetPasswordToken);
      if (decodedClient.email !== req.body.email) {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(COMMON.REGISTER_EMAIL_NOT_MATCH, ErrorCode.CREDENTIAL_NOT_MATCH),
        };
      }
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(COMMON.RESET_PASSWORD_TOKEN_EXPIRE, ErrorCode.TOKEN_EXPIRED),
        };
      } else {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(COMMON.TOKEN_INVALID, ErrorCode.TOKEN_INVALID),
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
        login(email: $email, password: $password) ${req.body.query}
      }
    }`;

    const promise = self.execute(
      query,
      {
        email: req.body.email,
        password: req.body.password,
      },
      req.body.query
    );

    return getGeneratorFunctionData(promise).then((result) => {
      const client = result?.data?.client?.login;
      if (client) {
        return self.Service.updateClientSessionId(req.session.id, client.clientId).then(() => {
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
    return self.Service.deleteClientSessionId(req.session.client.clientId).then(async () => {
      await req.session.destroy();
      return messageCreator(USER.LOGOUT_SUCCESS);
    });
  }
}

module.exports = ClientRouter;
