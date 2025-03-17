const Router = require('../router.js');
const { verify } = require('jsonwebtoken');
const { upload, validateResultExecute, serializer, validation } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE, REQUEST_DATA_PASSED_TYPE } = require('#constants');
const { messageCreator, fetchHelper, getOriginInternalServerUrl } = require('#utils');
const EmailService = require('#services/email.js');
const loginRequire = require('#middlewares/auth/login-require.js');
const authentication = require('#middlewares/auth/authentication.js');
const allowInternalCall = require('#middlewares/only-allow-internal-call.js');
const {
  UserPagination,
  LoginResponse,
  OtpVerifyResponse,
  OtpUpdateResponse,
  EmailsResponse,
  UserDetailResponse,
  PersonUpdateResponse,
} = require('#dto/user/user-out.js');
const {
  UserPaginationInput,
  Login,
  OtpVerify,
  OtpUpdate,
  MfaUpdate,
  UserDetail,
  UserUpdate,
  UserDelete,
} = require('#dto/user/user-in.js');
const MessageSerializerResponse = require('#dto/common/message-serializer-response.js');

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
    this.post('/add', authentication, this._addUser);
    this.post('/pagination', authentication, this._pagination);
    this.post('/update-mfa', authentication, this._updateMfaState);
    this.delete('/delete-user/:id', authentication, this._deleteUser);
    this.post('/user-detail', authentication, this._getUserDetail);
    this.put('/update-user', authentication, this._updateUser);
    this.post('/send-otp', loginRequire, this._sendOtpCode);
    this.post('/update-otp', allowInternalCall, this._updateOtpCode);
    this.put('/update-person', authentication, this._updatePerson);
    this.post('/login', this._login);
    this.post('/verify-otp', loginRequire, this._verifyOtp);
    this.get('/emails', authentication, this._getAllEmail);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(UserUpdate, { error_message: 'Add user failed!', groups: ['create'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _addUser(req, res, next, self) {
    const query = `mutation AddUser($user: UserInformationInput!) {
      user {
        add(user: $user) {
          message
        }
      }
    }`;
    const variables = {
      userId: Date.now(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      avatar: req.body.avatar,
      mfaEnable: req.body.mfa === 'true'
    };
    return self.execute(query, { user: variables });
  }

  @validation(UserPaginationInput, { error_message: 'Load users failed!' })
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

  @validation(MfaUpdate, { error_message: 'Update mfa failed!' })
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
    error_message: 'Delete user failed!',
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

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(UserUpdate, { error_message: 'Update personal information failed!', groups: ['update_person'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(PersonUpdateResponse)
  _updatePerson(req, res, next, self) {
    const userLogged = verify(req.get('authorization'), process.env.SECRET_KEY);

    const query = `mutation UpdatePerson($person: PersonInputType!) {
      user {
        updatePerson(person: $person) {
          message,
          reLoginFlag
        }
      }
    }`;

    const variables = {
      userId: userLogged.userId,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      avatar: req.body.avatar,
      password: req.body.password
    };

    return self.execute(
      query,
      { person: variables },
    );
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validation(UserUpdate, { error_message: 'Update user failed!', groups: ['update'] })
  @validateResultExecute(HTTP_CODE.CREATED)
  @serializer(MessageSerializerResponse)
  _updateUser(req, res, next, self) {
    const variables = {
      userId: req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      avatar: req.body.avatar,
      mfaEnable: req.body.mfa === 'true'
    };
    const query = `
      mutation UpdateUser($user: UserInformationInput!) {
        user {
          update(user: $user) {
            message
          }
        }
      }`;
    return self.execute(query, { user: variables });
  }

  @validation(UserDetail)
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

  @validation(Login)
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

  @validation(OtpVerify)
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

  @validation(OtpUpdate)
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
  @serializer(EmailsResponse)
  _getAllEmail(req, res, next, self) {
    const query = `query GetAllEmail {
      user {
        emails
      }
    }`;
    return self.execute(query);
  }

  @validateResultExecute(HTTP_CODE.OK)
  @serializer(MessageSerializerResponse)
  _sendOtpCode(req, res, next, self) {
    const url = getOriginInternalServerUrl(req);

    return fetchHelper(`${url}/update-otp`,
      'POST',
      {
        'Content-Type': 'application/json'
      },
      JSON.stringify(req.body)
    )
    .then(async (response) => {
      if (![HTTP_CODE.OK, HTTP_CODE.CREATED].includes(response.status)) {
        return Promise.reject(await response.json());
      }
      return response.json();
    })
    .then((json) => {
      const { otp, message } = json;
      return EmailService.sendOtpEmail(req.body.email, otp).then(() => messageCreator(message));
    });
  }
}

module.exports = UserRouter;
