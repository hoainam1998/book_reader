const fetch = require('node-fetch');
const { PrismaDuplicateError } = require('#test/mocks/prisma-error');
const GraphqlResponse = require('#dto/common/graphql-response');
const EmailService = require('#services/email');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, authenticationToken, sessionData, resetPasswordToken, randomPassword, getResetPasswordLink } = require('#test/resources/auth');
const { autoGeneratePassword } = require('#utils');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const createUserUrl = `${PATH.USER}/create-user`;
const addUserUrl = `${PATH.USER}/add`;

const createUserResponse = {
  password: randomPassword,
  resetPasswordToken: resetPasswordToken
};

const requestBody = {
  firstName: mockUser.first_name,
  lastName:  mockUser.last_name,
  email: mockUser.email,
  sex: mockUser.sex,
  phone: mockUser.phone,
  mfa: true,
  power: true,
};

afterAll((done) => globalThis.TestServer.removeTestMiddleware(done));

describe('create user', () => {
  commonTest('create user api common test', [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.USER}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: createUserUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'create user api cors',
        url: createUserUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      }
  ], 'create user common test');

  describe(createDescribeTest(METHOD.POST, createUserUrl), () => {
    test('create user will be success', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = sessionData.user;
      });

      fetch.mockResolvedValue(new Response(JSON.stringify(createUserResponse), { status: HTTP_CODE.CREATED }));
      const sendPassword = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      globalThis.api
        .post(createUserUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          const link = getResetPasswordLink(createUserResponse.resetPasswordToken);
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(addUserUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(sendPassword).toHaveBeenCalledTimes(1);
          expect(sendPassword).toHaveBeenCalledWith(mockUser.email, link, createUserResponse.password);
          expect(response.body).toMatchObject({
            message: USER.USER_ADDED
          });
          done();
        });
    });

    test('create user failed with authorization error', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = sessionData.user;
      });

      const sendPassword = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      globalThis.api
        .post(createUserUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(fetch).not.toHaveBeenCalled();
          expect(sendPassword).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: expect.any(String)
          });
          done();
        });
    });

    test('create user failed with do not enough permission', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = { ...sessionData.user, role: POWER.USER };
      });

      const sendPassword = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      globalThis.api
        .post(createUserUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.NOT_PERMISSION)
        .then((response) => {
          expect(fetch).not.toHaveBeenCalled();
          expect(sendPassword).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: USER.NOT_PERMISSION
          });
          done();
        });
    });

    test('create user failed with bad request', (done) => {
      // missing email field
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = sessionData.user;
      });

      fetch.mockResolvedValue(
        new Response(JSON.stringify({
          message: getInputValidateMessage(USER.ADD_USER_FAIL),
          errors: []
        }),
        { status: HTTP_CODE.BAD_REQUEST }));

      const sendPassword = jest.spyOn(EmailService, 'sendPassword').mockResolvedValue();

      globalThis.api
        .post(createUserUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(addUserUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(sendPassword).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: getInputValidateMessage(USER.ADD_USER_FAIL),
            errors: []
          });
          done();
        });
    });

    test('create user failed with server error', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = sessionData.user;
      });

      fetch.mockResolvedValue(
        new Response(JSON.stringify({
          message: COMMON.INTERNAL_ERROR_MESSAGE
        }),
        { status: HTTP_CODE.SERVER_ERROR })
      );

      const sendPassword = jest.spyOn(EmailService, 'sendPassword').mockRejectedValue();

      globalThis.api
        .post(createUserUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(addUserUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(sendPassword).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: COMMON.INTERNAL_ERROR_MESSAGE
          });
          done();
        });
    });
  });

  commonTest('create user internal api common test', [
    {
      name: 'cors test',
      describe: 'create user internal api cors',
      url: addUserUrl,
      method: METHOD.POST.toLowerCase(),
    }
  ], 'create user internal');

  describe(createDescribeTest(METHOD.POST, addUserUrl), () => {
    test('add user will be success', (done) => {
      globalThis.prismaClient.user.create.mockResolvedValue({
        plain_password: createUserResponse.password,
        reset_password_token: createUserResponse.resetPasswordToken,
        power: true,
      });

      globalThis.api
        .post(addUserUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                first_name: requestBody.firstName,
                last_name: requestBody.lastName,
                email: requestBody.email,
                sex: requestBody.sex,
                power: requestBody.power,
                phone: requestBody.phone,
                mfa_enable: requestBody.mfa,
              })
            })
          );
          expect(response.body).toMatchObject({
            password: expect.any(String),
            resetPasswordToken: expect.any(String),
          });
          expect(response.body.password).toHaveLength(8);
          done();
        });
    });

    test('add user failed with bad request', (done) => {
      // missing email field.
      // avatar, image are unexpected fields.
      const badRequestBody = { ...requestBody, avatar: 'avatar', image: 'image' };
      delete badRequestBody.email;

      globalThis.api
        .post(addUserUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.create).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: getInputValidateMessage(USER.ADD_USER_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(3);
          done();
        });
    });

    test('add user failed with output validate error', (done) => {
      globalThis.prismaClient.user.create.mockResolvedValue({
        plain_password: createUserResponse.password,
        reset_password_token: createUserResponse.resetPasswordToken,
        power: true,
      });

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({
          data: {
            password: autoGeneratePassword(),
          }
        })
      );

      globalThis.api
        .post(addUserUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                first_name: requestBody.firstName,
                last_name: requestBody.lastName,
                email: requestBody.email,
                sex: requestBody.sex,
                power: requestBody.power,
                phone: requestBody.phone,
                mfa_enable: requestBody.mfa,
              })
            })
          );
          expect(response.body).toMatchObject({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'email or phone number have already exist',
        cause: PrismaDuplicateError,
        expected: {
          message: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER
        },
        status: HTTP_CODE.BAD_REQUEST
      },
      {
        describe: 'server error',
        cause: new Error('Server error!'),
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('add user failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.user.create.mockRejectedValue(cause);

      globalThis.api
        .post(addUserUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(status)
        .then((response) => {
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
              data: expect.objectContaining({
                first_name: requestBody.firstName,
                last_name: requestBody.lastName,
                email: requestBody.email,
                sex: requestBody.sex,
                power: requestBody.power,
                phone: requestBody.phone,
                mfa_enable: requestBody.mfa,
              })
            })
          );
          expect(response.body).toMatchObject(expected);
          done();
        });
    });
  });
});
