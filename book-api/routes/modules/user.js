const Router = require('../router');
const { upload, validateResultExecute, serializer, validation } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE, METHOD, RESET_PASSWORD_URL } = require('#constants');
const { USER, COMMON } = require('#messages');
const {
  messageCreator,
  fetchHelper,
  getOriginInternalServerUrl,
  verifyResetPasswordToken,
} = require('#utils');
const EmailService = require('#services/email');
const ErrorCode = require('#services/error-code');
const loginRequire = require('#middlewares/auth/login-require');
const otpAllowed = require('#middlewares/auth/otp-allowed');
const authentication = require('#middlewares/auth/authentication');
const onlyAdminAllowed = require('#middlewares/auth/only-admin-allowed');
const allowInternalCall = require('#middlewares/only-allow-internal-call');
const {
  UserPagination,
  LoginResponse,
  OtpVerifyResponse,
  OtpUpdateResponse,
  AllUsersResponse,
  UserDetailResponse,
  UserCreatedResponse,
} = require('#dto/user/user-out');
const {
  UserPaginationInput,
  OtpVerify,
  OtpUpdate,
  MfaUpdate,
  AdminResetPassword,
  UserDetail,
  UserUpdate,
  PersonUpdate,
  UserDelete,
  AllUser,
} = require('#dto/user/user-in');
const Login = require('#dto/common/login-validator');
const MessageSerializerResponse = require('#dto/common/message-serializer-response');

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
    this.post('/create-user', authentication, onlyAdminAllowed, this._createUser);
    this.post('/add', allowInternalCall, this._addUser);
    this.post('/pagination', authentication, this._pagination);
    this.post('/update-mfa', authentication, this._updateMfaState);
    this.post('/reset-password', this._resetPassword);
    this.delete('/delete-user/:id', authentication, onlyAdminAllowed, this._deleteUser);
    this.post('/user-detail', authentication, onlyAdminAllowed, this._getUserDetail);
    this.put('/update-user', authentication, onlyAdminAllowed, this._updateUser);
    this.put('/update-person', authentication, this._updatePerson);
    this.post('/send-otp', loginRequire, otpAllowed, this._sendOtpCode);
    this.post('/update-otp', allowInternalCall, this._updateOtpCode);
    this.post('/login-process', allowInternalCall, this._login);
    this.post('/login', this._loginWithSession);
    this.get('/logout', authentication, this._logout);
    this.post('/verify-otp', loginRequire, otpAllowed, this._verifyOtpWithSession);
    this.post('/verify-otp-process', allowInternalCall, this._verifyOtp);
    this.post('/all', authentication, this._getAllUsers);
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

  @validation(UserPaginationInput, { error_message: USER.PAGINATION_LOAD_USER_FAIL })
  @validateResultExecute(HTTP_CODE.OK)
  @serializer(UserPagination)
  _pagination(req, res, next, self) {
    const query = `query UserPagination($pageSize: Int, $pageNumber: Int, $keyword: String) {
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

  @validation(UserDelete, {
    error_message: USER.DELETE_USER_FAIL,
    request_data_passed_type: REQUEST_DATA_PASSED_TYPE.PARAM
  })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _deleteUser(req, res, next, self) {
    const query = `mutation DeleteUser($userId: ID!) {
      user {
        delete(userId: $userId) {
          message
        }
      }
    }`;

    return self.execute(query, { userId: req.params.id });
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

  @validation(AllUser, { error_message: USER.LOAD_ALL_USER_FAIL })
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
      email: req.body.email,
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
        'Content-Type': 'application/json'
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
    return self.execute(query, { email: req.body.email, });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _sendOtpCode(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(`${url}/update-otp`,
      METHOD.POST,
      {
        'Content-Type': 'application/json'
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
      return EmailService.sendOtpEmail(req.body.email, otp)
        .then(() => messageCreator(message));
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

    if (req.session.user) {
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
      req.session.user = {
        userId: json.userId,
        email: json.email,
        mfaEnable: json.mfaEnable,
        apiKey: json.apiKey,
        role: json.role,
      };
      return json;
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _logout(req, res, next, self) {
    return new Promise((resolve) => {
      req.session.destroy(() => resolve(messageCreator(USER.LOGOUT_SUCCESS)));
    });
  }
}

module.exports = UserRouter;
