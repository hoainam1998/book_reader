const Router = require('../router.js');
const { execute } = require('graphql');
const { verify } = require('jsonwebtoken');
const cors = require('cors');
const { upload, validateQuery, validateResultExecute } = require('#decorators');
const { UPLOAD_MODE, HTTP_CODE } = require('#constants');
const { sendMail, messageCreator } = require('#utils');
const loginRequire = require('#auth/login-require');

const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    origin: `${req.protocol}://${req.get('host')}`,
  };
  callback(null, corsOptions);
};

class UserRouter extends Router {
  constructor(express, schema) {
    super(express, schema);
    this.post('/add', this._addUser);
    this.post('/pagination', loginRequire, this._pagination);
    this.post('/update-mfa', loginRequire, this._updateMfaState);
    this.post('/delete-user', loginRequire, this._deleteUser);
    this.post('/user-detail', loginRequire, this._getUserDetail);
    this.post('/update-user', loginRequire,  this._updateUser);
    this.post('/send-otp', this.sendOtpCode);
    this.post('/update-otp', cors(corsOptionsDelegate), this._updateOtpCode);
    this.post('/update-person', this.updatePerson);
    this.post('/update-person-internal', cors(corsOptionsDelegate), this._updatePerson);
    this.post('/login', this._login);
    this.post('/verify-otp', this._verifyOtp);
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _addUser(req, res, next, schema) {
    const variables = {
      userId: Date.now(),
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      avatar: req.body.avatar,
      mfaEnable: req.body.mfa === 'true'
    };
    return execute({
      schema,
      document: req.body.query,
      variableValues: { user: variables },
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _pagination(req, res, next, schema) {
    return execute({
      schema,
      document: req.body.query,
      variableValues: {
        pageSize: req.body.pageSize,
        pageNumber: req.body.pageNumber,
        keyword: req.body.keyword,
      },
    });
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _updateMfaState(req, res, next, schema) {
    return execute({
      schema,
      document: req.body.query,
      variableValues: {
        userId: req.body.userId,
        mfaEnable: req.body.mfaEnable,
      },
    });
  }

  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _deleteUser(req, res, next, schema) {
    return execute({
      schema,
      document: req.body.query,
      variableValues: {
        userId: req.body.userId,
      },
    });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _updatePerson(req, res, next, schema) {
    console.log('zooo');
    const variables = {
      userId: req.body.userId,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      avatar: req.body.avatar,
      password: req.body.password
    };
    return execute({
      schema,
      document: req.body.query,
      variableValues: { person: variables },
    });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  @validateResultExecute(HTTP_CODE.CREATED)
  @validateQuery
  _updateUser(req, res, next, schema) {
    const variables = {
      userId: req.body.userId,
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      avatar: req.body.avatar,
      mfaEnable: req.body.mfa === 'true'
    };
    return execute({
      schema,
      document: req.body.query,
      variableValues: { user: variables },
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _getUserDetail(req, res, next, schema) {
    return execute({
      schema,
      document: req.body.query,
      variableValues: {
        userId: req.body.userId,
      },
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _login(req, res, next, schema) {
    return execute({
      schema,
      document: req.body.query,
      variableValues: {
        email: req.body.email,
        password: req.body.password,
      },
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _verifyOtp(req, res, next, schema) {
    return execute({
      schema,
      document: req.body.query,
      variableValues: {
        email: req.body.email,
        otp: req.body.otp,
      },
    });
  }

  @validateResultExecute(HTTP_CODE.OK)
  @validateQuery
  _updateOtpCode(req, res, next, schema) {
    return execute({
      schema,
      document: req.body.query,
      variableValues: {
        email: req.body.email,
      },
    });
  }

  @upload(UPLOAD_MODE.SINGLE, 'avatar')
  updatePerson(req, res, next, schema) {
    const url = `${req.protocol}:${req.get('host')}${req.baseUrl}`;
    const formData = new FormData();
    const user = verify(req.get('authorization'), process.env.SECRET_KEY);
    const userId = user.userId;
    formData.append('userId', userId);
    formData.append('query',
      `mutation UpdatePerson($person: PersonInputType) {
        user {
          updatePerson(person: $person) {
            message
          }
        }
      }`
    );
    Object.keys(req.body).forEach(key => {
      formData.append(key, req.body[key]);
    });

    fetch(`${url}/update-person-internal`, {
      method: 'POST',
      body: formData
    }).then((result) => {
      result.json().then(json => {
        res.status(result.status).json({ message: json.user.updatePerson.message });
      });
    })
    .catch(err => res.status(HTTP_CODE.BAD_REQUEST).json({ message: err.message }));
  }

  sendOtpCode(req, res, next, schema) {
    const url = `${req.protocol}:${req.get('host')}${req.baseUrl}`;
    const body = {
      query: `
        mutation SendOtp($email: String) {
          user {
            updateOtpCode(email: $email) {
              message,
              otp
            }
          }
        }
      `,
      email: req.body.email,
    };

    fetch(`${url}/update-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((json) => {
        try {
          sendMail(json.user.updateOtpCode.otp, req.body.email)
          .then(
            () => {
              res.json({
                message: json.user.updateOtpCode.message,
              });
            }
          )
          .catch(() => res.status(400).json(messageCreator('Send otp failed!')));
        } catch (err) {
          throw err;
        }
      })
      .catch((err) => res.json({ message: err.message }));
  }
}

module.exports = UserRouter;
