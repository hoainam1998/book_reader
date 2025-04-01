const request = require('supertest');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { plainToInstance } = require('class-transformer');
const app = require('../../../index');
const UserDTO = require('#dto/user/user');
const GraphqlResponse = require('#dto/common/graphql-response');
const prismaClient = require('#services/prisma-client');
const { HTTP_CODE, PATH } = require('#constants');
const { COMMON, USER } = require('#messages');
const { urlNotFound, methodNotAllowed } = require('../common/common.js');

const mockUser = {
  user_id: Date.now().toString(),
  first_name: 'nguyen',
  last_name: 'nam',
  email: 'namdang201999@gmail.com',
  avatar: 'avatar',
  mfa_enable: true,
  password: 'namtran9',
};

jest.mock('#services/prisma-client', () => ({
  user: {
    findFirstOrThrow: jest.fn().mockResolvedValue(new Promise(() => {}))
  }
}));

describe('user api group test', () => {
  describe('login api test', () => {
    const loginUrl = `${PATH.USER}/login`;

    afterEach(() => {
      prismaClient.user.findFirstOrThrow.mockReset();
    });

    urlNotFound('url invalid', request(app).post(`${PATH.USER}/unknown`));
    methodNotAllowed('method not allowed', request(app).get(loginUrl));

    test('login success', (done) => {
      prismaClient.user.findFirstOrThrow.mockResolvedValue({
        user_id: Date.now().toString(),
        first_name: 'nguyen',
        last_name: 'nam',
        email: 'namdang201999@gmail.com',
        avatar: 'avatar',
        mfa_enable: true,
        password: 'namtran9',
      });

      request(app)
        .post(loginUrl)
        .send({
          email: mockUser.email,
          password: mockUser.password,
          query: {
            name: true,
            apiKey: true,
            avatar: true,
            email: true,
            mfaEnable: true,
            password: true,
          },
        })
        .expect(HTTP_CODE.OK)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          const plainUser = plainToInstance(UserDTO, mockUser);
          expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
          expect(response.body.apiKey).toBeDefined();
          expect(response.body).toHaveProperty('name', plainUser.name);
          expect(response.body).toHaveProperty('avatar', plainUser.avatar);
          expect(response.body).toHaveProperty('email', plainUser.email);
          expect(response.body).toHaveProperty('mfaEnable', plainUser.mfaEnable);
          expect(response.body).toHaveProperty('password', plainUser.password);
          done();
        });
    }, 1000);

    test('login failed with bad request', (done) => {
      request(app)
        .post(loginUrl)
        .send({
          query: {
            name: true,
            apiKey: true,
            avatar: true,
            email: true,
            mfaEnable: true,
            password: true,
          },
        })
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          const message = `${USER.LOGIN_FAIL}\n${COMMON.INPUT_VALIDATE_FAIL}`;
          expect(prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
          expect(response.body.message).toMatch(message);
          expect(response.body.errors).toHaveLength(2);
          done();
        });
    }, 1000);

    test('login failed with output validated error', (done) => {
      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({ data: { email: 'unknown9@gmail.com' }, response: {}})
      );

      prismaClient.user.findFirstOrThrow.mockResolvedValue({
        user_id: Date.now().toString,
        first_name: 'nguyen',
        last_name: 'nam',
        email: 'namdang201999@gmail.com',
        avatar: 'avatar',
        mfa_enable: true,
        password: 'namtran9',
      });

      request(app)
        .post(loginUrl)
        .send({
          email: mockUser.email,
          password: mockUser.password,
          query: {
            name: true,
            apiKey: true,
            avatar: true,
            email: true,
            mfaEnable: true,
            password: true,
          },
        })
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
          expect(response.body.message).toMatch(COMMON.OUTPUT_VALIDATE_FAIL);
          done();
        });
    }, 1000);

    test('login failed with user not found', (done) => {
      prismaClient.user.findFirstOrThrow
        .mockRejectedValue(new PrismaClientKnownRequestError('Record not found!', { code: 'P2025' }));

      request(app)
        .post(loginUrl)
        .send({
          email: 'namdang1998@gmail.com',
          password: 'namtran8',
          query: {
            name: true,
            apiKey: true,
            avatar: true,
            email: true,
            mfaEnable: true,
            password: true,
          },
        })
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
          expect(response.body.message).toMatch('User not found');
          expect(response.body.errors).not.toBeDefined();
          done();
        });
    }, 1000);

    test('login failed with server error', (done) => {
      prismaClient.user.findFirstOrThrow
        .mockRejectedValue(new Error('Server error!'));

      request(app)
        .post(loginUrl)
        .send({
          email: mockUser.email,
          password: mockUser.password,
          query: {
            name: true,
            apiKey: true,
            avatar: true,
            email: true,
            mfaEnable: true,
            password: true,
          },
        })
        .expect(HTTP_CODE.SERVER_ERROR)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
          expect(response.body.message).toMatch(COMMON.INTERNAL_ERROR_MESSAGE);
          expect(response.body.errors).not.toBeDefined();
          done();
        });
    }, 1000);
  });
});
