const Router = require('../router');
const { upload, validateResultExecute, serializer, validation } = require('#decorators');
const {
  UPLOAD_MODE,
  HTTP_CODE,
  REQUEST_DATA_PASSED_TYPE,
  METHOD,
  RESET_PASSWORD_URL,
  POWER,
} = require('#constants');
const { USER, COMMON } = require('#messages');
const {
  messageCreator,
  fetchHelper,
  getOriginInternalServerUrl,
  verifyResetPasswordToken,
  getGeneratorFunctionData,
} = require('#utils');
const EmailService = require('#services/email');
const ErrorCode = require('#services/error-code');
const UserRoutePath = require('#services/route-paths/user');
const loginRequire = require('#middlewares/auth/login-require');
const otpAllowed = require('#middlewares/auth/otp-allowed');
const authentication = require('#middlewares/auth/authentication');
const onlyAdminAllowed = require('#middlewares/auth/only-admin-allowed');
const allowInternalCall = require('#middlewares/only-allow-internal-call');
const onlyAllowOneDevice = require('#middlewares/auth/only-use-one-device');
const {
  UserPagination,
  LoginResponse,
  OtpVerifyResponse,
  OtpUpdateResponse,
  AllUsersResponse,
  UserDetailResponse,
  UserCreatedResponse,
  ForgetPasswordResponse,
} = require('#dto/user/user-out');
const {
  UserPaginationInput,
  OtpVerify,
  OtpUpdate,
  MfaUpdate,
  PowerUpdate,
  AdminResetPassword,
  UserDetail,
  UserUpdate,
  PersonUpdate,
  UserDelete,
  AllUser,
  UserForgetPassword,
} = require('#dto/user/user-in');
const Login = require('#dto/common/login-validator');
const MessageSerializerResponse = require('#dto/common/message-serializer-response');

/**
* Remove some fields that do not allow loading when the user has a user role.
*
* @param {Object} req - The express request.
* @param {string[]} - The exclude fields.
*/
const excludePaginationQueryFields = (req) => {
  if (
    req.session.isDefined('user')
    && req.session.user.isDefined('role')
    && req.session.user.role === POWER.USER) {
      return ['userId', 'mfaEnable', 'isAdmin'];
  }
  return [];
};

/**
 * Organize user routes.
 * @class
 * @extends Router
 */
class UserRouter extends Router {
  /**
  * Create userRouter instance.
  *
  * @param {Object} express - The express object.
  * @param {Object} graphqlExecute - The graphql execute instance.
  */
  constructor(express, graphqlExecute) {
    super(express, graphqlExecute);
    this.post(UserRoutePath.createUser, authentication, onlyAdminAllowed, this._createUser);
    this.post(UserRoutePath.add, allowInternalCall, this._addUser);
    this.post(UserRoutePath.pagination, authentication, this._pagination);
    this.post(UserRoutePath.updateMfa, authentication, onlyAdminAllowed, this._updateMfaState);
    this.post(UserRoutePath.updatePower, authentication, onlyAdminAllowed, this._updatePower);
    this.post(UserRoutePath.resetPassword, onlyAllowOneDevice, this._resetPassword);
    this.delete(UserRoutePath.delete, authentication, onlyAdminAllowed, this._deleteUser);
    this.post(UserRoutePath.userDetail, authentication, onlyAdminAllowed, this._getUserDetail);
    this.put(UserRoutePath.updateUser, authentication, onlyAdminAllowed, this._updateUser);
    this.put(UserRoutePath.updatePerson, authentication, this._updatePerson);
    this.post(UserRoutePath.sendOtp, loginRequire, otpAllowed, this._sendOtpCode);
    this.post(UserRoutePath.updateOtp, allowInternalCall, this._updateOtpCode);
    this.post(UserRoutePath.loginProcess, allowInternalCall, this._login);
    this.post(UserRoutePath.login, onlyAllowOneDevice, this._loginWithSession);
    this.get(UserRoutePath.logout, loginRequire, this._logout);
    this.post(UserRoutePath.verifyOtp, loginRequire, otpAllowed, this._verifyOtpWithSession);
    this.post(UserRoutePath.verifyOtpProcess, allowInternalCall, this._verifyOtp);
    this.post(UserRoutePath.forgetPasswordProcess, allowInternalCall, this._forgetPasswordProcess);
    this.post(UserRoutePath.forgetPassword, this._forgetPassword);
    this.post(UserRoutePath.all, authentication, this._getAllUsers);
  }

  @validation(UserUpdate, { error_message: USER.ADD_USER_FAIL, groups: ['create'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(UserCreatedResponse)
  _addUser(req, res, next, self) {
    const query = `mutation AddUser($user: UserInformationCreateInput!) {
      user {
        add(user: $user) {
          resetPasswordToken,
          password
        }
      }
    }`;
    const variables = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      sex: +req.body.sex,
      phone: req.body.phone,
      power: Object.hasOwn(req.body, 'power') ? JSON.parse(req.body.power) : undefined,
      mfaEnable: Object.hasOwn(req.body, 'mfa') ? JSON.parse(req.body.mfa) : undefined,
    };
    return self.execute(query, { user: variables });
  }

  @validation(UserPaginationInput, {
    error_message: USER.PAGINATION_LOAD_USER_FAIL,
    exclude_query_fields: excludePaginationQueryFields
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(UserPagination)
  _pagination(req, res, next, self) {
    const query = `query UserPagination($pageSize: Int!, $pageNumber: Int!, $keyword: String) {
      user {
        pagination (pageSize: $pageSize, pageNumber: $pageNumber, keyword: $keyword) {
          list ${
            req.body.query
          },
          total
        }
      }
    }`;

    return self.execute(query, {
        pageSize: req.body.pageSize,
        pageNumber: req.body.pageNumber,
        keyword: req.body.keyword,
      },
      req.body.query
    );
  }

  @validation(MfaUpdate, { error_message: USER.UPDATE_MFA_STATE_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateMfaState(req, res, next, self) {
    const query = `mutation UpdateMfaState($userId: ID!, $mfaEnable: Boolean!) {
      user {
        updateMfaState(userId: $userId, mfaEnable: $mfaEnable) {
          message
        }
      }
    }`;
    return self.execute(
      query,
      {
        userId: req.body.userId,
        mfaEnable: req.body.mfaEnable,
      },
    );
  }

  @validation(PowerUpdate, { error_message: USER.UPDATE_POWER_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updatePower(req, res, next, self) {
    const query = `mutation UpdatePower($userId: ID!, $power: Boolean!) {
      user {
        updatePower(userId: $userId, power: $power) {
          message
        }
      }
    }`;
    return self.execute(
      query,
      {
        userId: req.body.userId,
        power: req.body.power,
      },
    );
  }

  @validation(UserDelete, {
    error_message: USER.DELETE_USER_FAIL,
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _deleteUser(req, res, next, self) {
    const query = `mutation DeleteUser($userId: ID!) {
      user {
        delete(userId: $userId) {
          message
        }
      }
    }`;

    return self.Service.deleteUserSessionId(req.params.id)
      .then((user) => {
        return new Promise((resolve) => {
          return req.sessionStore.destroy(user.session_id, function () {
            if (self.Socket.Clients.has(req.params.id)) {
              self.Socket.Clients.get(req.params.id).send({ delete: true });
            }
            resolve(getGeneratorFunctionData(self.execute(query, { userId: req.params.id })));
          });
        });
      });
  }

  @validation(UserUpdate, { error_message: USER.UPDATE_USER_FAIL, groups: ['update'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateUser(req, res, next, self) {
    const variables = {
      userId: req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      sex: +req.body.sex,
      phone: req.body.phone,
      power: Object.hasOwn(req.body, 'power') ? JSON.parse(req.body.power) : undefined,
      mfaEnable: Object.hasOwn(req.body, 'mfa') ? JSON.parse(req.body.mfa) : undefined,
    };
    const query = `mutation UpdateUser($user: UserInformationInput!) {
      user {
        updateUser(user: $user) {
          message
        }
       }
    }`;
    return self.execute(query, { user: variables });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(PersonUpdate, { error_message: USER.UPDATE_USER_FAIL })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updatePerson(req, res, next, self) {
    const variables = {
      userId: req.session.user.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      sex: +req.body.sex,
      phone: req.body.phone,
      avatar: req.body.avatar,
    };

    const query = `mutation UpdatePerson($person: UserInformationUpdatePersonInput!) {
      user {
        updatePerson(person: $person) {
          message
        }
       }
    }`;

    return self.execute(query, { person: variables });
  }

  @validation(UserDetail, { error_message: USER.LOAD_USER_DETAIL_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(UserDetailResponse)
  _getUserDetail(req, res, next, self) {
    const query = `query GetUserDetail($userId: ID!) {
      user {
        detail(userId: $userId) ${
          req.body.query
        }
      }
    }`;
    return self.execute(
      query,
      { userId: req.body.userId, },
      req.body.query
    );
  }

  @validation(AdminResetPassword, { error_message: USER.RESET_PASSWORD_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _resetPassword(req, res, next, self) {
    const query = `mutation ResetPassword($resetPasswordToken: String!, $email: String!, $oldPassword: String!, $password: String!) {
      user {
        resetPassword(resetPasswordToken: $resetPasswordToken, email: $email, oldPassword: $oldPassword, password: $password) {
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
      const decodedUser = verifyResetPasswordToken(req.body.resetPasswordToken);
      if (!decodedUser) {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(USER.USER_NOT_FOUND, ErrorCode.CREDENTIAL_NOT_MATCH)
        };
      } else if (decodedUser.email !== req.body.email) {
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

    return self.execute(query, req.body);
  }

  @validation(AllUser, {
    error_message: USER.LOAD_ALL_USER_FAIL,
    exclude_query_fields: excludePaginationQueryFields
  })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(AllUsersResponse)
  _getAllUsers(req, res, next, self) {
    const query = `query GetAllUsers($exceptedUserId: ID) {
      user {
        all(exceptedUserId: $exceptedUserId) ${
          req.body.query
        }
      }
    }`;
    return self.execute(query, { exceptedUserId: req.body.exceptedUserId }, req.body.query);
  }

  @validation(OtpVerify, { error_message: USER.VERIFY_OTP_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(OtpVerifyResponse)
  _verifyOtp(req, res, next, self) {
    const variables = {
      email: req.session.user.email,
      otp: req.body.otp,
    };

    const query = `query VerifyOTP($email: String!, $otp: String!) {
      user {
        verifyOtp(email: $email, otp: $otp) ${
          req.body.query
        }
      }
    }`;

    return self.execute(query, variables);
  }

  @validateResultExecute(HTTP_CODE.OK)
  _verifyOtpWithSession(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(`${url}/verify-otp-process`,
      METHOD.POST,
      {
        'Content-Type': 'application/json',
        'Cookie': [req.headers.cookie],
      },
      JSON.stringify(req.body)
    ).then(async (response) => {
      const json = response.json();
      if (response.status === HTTP_CODE.OK) {
        return json;
      }
      return Promise.reject({ ...await json, status: response.status });
    })
    .then((json) => {
      req.session.user.apiKey = json.apiKey;
      return json;
    });
  }

  @validation(OtpUpdate, { error_message: USER.UPDATE_OTP_CODE_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(OtpUpdateResponse)
  _updateOtpCode(req, res, next, self) {
    const query = `
      mutation SendOtp($email: String!) {
        user {
          updateOtpCode(email: $email) ${
            req.body.query
          }
        }
      }
    `;
    return self.execute(query, { email: req.session.user.email, });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _sendOtpCode(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(`${url}/update-otp`,
      METHOD.POST,
      {
        'Content-Type': 'application/json',
        'Cookie': [req.headers.cookie],
      },
      JSON.stringify(req.body)
    )
    .then(async (response) => {
      const json = response.json();
      if (response.status === HTTP_CODE.OK) {
        return json;
      }
      return Promise.reject({ ...await json, status: response.status });
    })
    .then((json) => {
      const { otp, message } = json;
      return EmailService.sendOtpEmail(req.session.user.email, otp)
        .then(() => messageCreator(message));
    })
    .catch((error) => {
      if (error.errorCode === ErrorCode.CREDENTIAL_NOT_MATCH) {
        req.session.destroy();
      }
      throw error;
    });
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _createUser(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(`${url}/add`,
      METHOD.POST,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify(req.body)
    )
    .then(async (response) => {
      const json = response.json();
      if (response.status === HTTP_CODE.CREATED) {
        return json;
      }
      return Promise.reject({ ...await json, status: response.status });
    })
    .then(({ resetPasswordToken, password }) => {
      const link = RESET_PASSWORD_URL.format(resetPasswordToken);
      return EmailService.sendPassword(req.body.email, link, password)
        .then(() => messageCreator(USER.USER_ADDED));
    });
  }

  @validation(Login, { error_message: USER.LOGIN_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(LoginResponse)
  _login(req, res, next, self) {
    const query = `
      query Login($email: String!, $password: String!) {
        user {
          login(email: $email, password: $password) ${
            req.body.query
          }
        }
      }`;
    return self.execute(query, {
      email: req.body.email,
      password: req.body.password,
    },
    req.body.query);
  }

  @validateResultExecute(HTTP_CODE.OK)
  _loginWithSession(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    if (req.session?.user) {
      if (req.body.email === req.session.user.email) {
        return {
          status: HTTP_CODE.UNAUTHORIZED,
          json: messageCreator(USER.ALREADY_LOGIN, ErrorCode.TOKEN_EXPIRED),
        };
      }
    }

    return fetchHelper(`${url}/login-process`,
      METHOD.POST,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify(req.body),
    ).then(async (response) => {
      const json = response.json();
      if (response.status === HTTP_CODE.OK) {
        return json;
      }
      return Promise.reject({ ...await json, status: response.status });
    })
    .then((json) => {
      return self.Service.updateUserSessionId(req.session.id, json.userId)
        .then(() => {
          req.session.user = {
            userId: json.userId,
            email: json.email,
            mfaEnable: json.mfaEnable,
            apiKey: json.apiKey,
            role: json.role,
          };
        return json;
      });
    });
  }

  @validation(UserForgetPassword, { error_message: USER.RESET_PASSWORD_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(ForgetPasswordResponse)
  _forgetPasswordProcess(req, res, next, self) {
    const query = `mutation ForgetPassword($email: String!) {
      user {
        forgetPassword(email: $email) {
          resetPasswordToken,
          password
        }
      }
    }`;
    return self.execute(query, { email: req.body.email });
  }

  @validateResultExecute(HTTP_CODE.OK)
  _forgetPassword(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(`${url}/forget-password-process`,
      METHOD.POST,
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify(req.body),
    ).then(async (response) => {
      const json = response.json();
      if (response.status === HTTP_CODE.OK) {
        return json;
      }
      return Promise.reject({ ...await json, status: response.status });
    })
    .then(({ resetPasswordToken, password }) => {
      const link = RESET_PASSWORD_URL.format(resetPasswordToken);
      return EmailService.sendPassword(req.body.email, link, password)
        .then(() => messageCreator(USER.UPDATE_PASSWORD));
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _logout(req, res, next, self) {
    return self.Service.deleteUserSessionId(req.session.user.userId)
      .then(async () => {
        await req.session.destroy();
        return messageCreator(USER.LOGOUT_SUCCESS);
      });
  }
}

module.exports = UserRouter;
