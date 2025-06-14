const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { plainToInstance } = require('class-transformer');
const UserDTO = require('#dto/user/user');
const GraphqlResponse = require('#dto/common/graphql-response');
const ErrorCode = require('#services/error-code');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const commonTest = require('#test/apis/common/common');
const { mockUser } = require('#test/resources/auth');
const { passwordHashing } = require('#utils');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const loginUrl = `${PATH.USER}/login`;
const internalLoginApiUrl = `${PATH.USER}/login-process`;

const requestBody = {
  email: mockUser.email,
  password: mockUser.password,
  query: {
    userId: true,
    name: true,
    apiKey: true,
    avatar: true,
    email: true,
    mfaEnable: true,
  },
};

let sessionToken = null;

describe('login api', () => {
  commonTest('login api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: loginUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'login api cors',
      url: loginUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS
    }
  ], 'login common test');

  describe(createDescribeTest(METHOD.POST, loginUrl), () => {
    afterEach(() => fetch.mockReset());

    test('login success', (done) => {
      const plainUser = plainToInstance(UserDTO, mockUser);
      fetch.mockResolvedValue(new Response(JSON.stringify({
        userId: mockUser.user_id,
        name: plainUser.name,
        email: mockUser.email,
        avatar: mockUser.avatar,
        mfaEnable: true,
        apiKey: null,
        power: 0,
      })));
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      expect.hasAssertions();
      globalThis.api.post(loginUrl)
        .send(requestBody)
        .expect(HTTP_CODE.OK)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(loginUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(response.body.apiKey).toBeDefined();
          expect(response.header).toMatchObject({
            'set-cookie': expect.arrayContaining([expect.any(String)])
          });
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
            where: {
              user_id: mockUser.user_id,
            },
            data: {
              session_id: expect.any(String),
            },
          });
          expect(response.body).toMatchObject({
            name: plainUser.name,
            avatar: plainUser.avatar,
            email: plainUser.email,
            mfaEnable: plainUser.mfaEnable
          });
          sessionToken = response.header['set-cookie'];
          done();
        });
    });

    test('login failed with update session id throw error', (done) => {
      const plainUser = plainToInstance(UserDTO, mockUser);
      fetch.mockResolvedValue(new Response(JSON.stringify({
        userId: mockUser.user_id,
        name: plainUser.name,
        email: mockUser.email,
        avatar: mockUser.avatar,
        mfaEnable: true,
        apiKey: null,
        power: 0,
      })));
      globalThis.prismaClient.user.update.mockRejectedValue(PrismaNotFoundError)

      expect.hasAssertions();
      globalThis.api.post(loginUrl)
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(loginUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
            where: {
              user_id: mockUser.user_id,
            },
            data: {
              session_id: expect.any(String),
            },
          });
          expect(response.body).toEqual({
            message: USER.USER_NOT_FOUND,
          });
          done();
        });
    });

    test('login failed when user already login', (done) => {
      expect.hasAssertions();
      globalThis.api.post(loginUrl)
        .set('Cookie', [sessionToken])
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.ONLY_ONE_DEVICE,
            errorCode: ErrorCode.ONLY_ALLOW_ONE_DEVICE,
          });
          done();
        });
      sessionToken = null;
    });

    test.each([
      {
        title: 'bad request',
        expected: {
          message: getInputValidateMessage(USER.LOGIN_FAIL),
          errors: [],
        },
        status: HTTP_CODE.BAD_REQUEST
      },
      {
        title: 'output validated error',
        expected: {
          message: COMMON.OUTPUT_VALIDATE_FAIL,
        },
        status: HTTP_CODE.BAD_REQUEST
      },
      {
        title: 'user not found',
        expected: {
          message: USER.USER_NOT_FOUND,
          errorCode: ErrorCode.CREDENTIAL_NOT_MATCH,
        },
        status: HTTP_CODE.UNAUTHORIZED
      },
      {
        title: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('login failed with $title', ({ expected, status }, done) => {
      fetch.mockResolvedValue(new Response(JSON.stringify(expected), { status }));

      expect.hasAssertions();
      globalThis.api.post(loginUrl)
        .send(requestBody)
        .expect(status)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(loginUrl),
            expect.objectContaining({
              method: METHOD.POST,
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: JSON.stringify(requestBody)
            })
          );
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });

  commonTest('login internal api common test', [
    {
      name: 'cors test',
      describe: 'login internal api cors',
      url: internalLoginApiUrl,
      method: METHOD.POST.toLowerCase(),
    }
  ], 'login internal');

  describe(createDescribeTest(METHOD.POST, internalLoginApiUrl), () => {
    test('login internal api will be success', async () => {
      const passwordHash = await passwordHashing(mockUser.password);

      globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({
        ...mockUser,
        password: passwordHash,
      });

      const response = await globalThis.api.post(internalLoginApiUrl).send(requestBody);
      const plainUser = plainToInstance(UserDTO, mockUser);

      expect.hasAssertions();
      expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            email: requestBody.email
          },
          select: expect.objectContaining({
            email: true,
            power: true,
            password: true,
            reset_password_token: true,
          })
        })
      );
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.OK);
      expect(response.body).toMatchObject({
        name: plainUser.name,
        avatar: plainUser.avatar,
        email: plainUser.email,
        mfaEnable: plainUser.mfaEnable
      });
    });

    test('login internal api failed with bad request', (done) => {
      expect.hasAssertions();
      globalThis.api.post(internalLoginApiUrl)
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
          expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
          expect(response.body.errors).toHaveLength(2);
          expect(response.body).toEqual(expect.objectContaining({
            message: getInputValidateMessage(USER.LOGIN_FAIL),
            errors: expect.any(Array),
          }));
          done();
        });
    });

    test('login internal api failed with output validated error', async () => {
      const passwordHash = await passwordHashing(mockUser.password);
      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({ data: { email: 'unknown9@gmail.com' }, response: {} })
      );

      globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({
        ...mockUser,
        password: passwordHash,
      });

      const response = await globalThis.api.post(internalLoginApiUrl).send(requestBody);

      expect.hasAssertions();
      expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            email: requestBody.email
          },
          select: expect.objectContaining({
            email: true,
            power: true,
            password: true,
            reset_password_token: true,
          })
        })
      );
      expect(response.body).toEqual({
        message: COMMON.OUTPUT_VALIDATE_FAIL
      });
    });

    test.each([
      {
        describe: 'user not found',
        expected: {
          message: USER.USER_NOT_FOUND,
        },
        cause: PrismaNotFoundError,
        status: HTTP_CODE.UNAUTHORIZED
      },
      {
        describe: 'unknown error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        cause: ServerError,
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('login internal api failed with $describe', ({ expected, status, cause }, done) => {
      globalThis.prismaClient.user.findFirstOrThrow.mockRejectedValue(cause);

      expect.hasAssertions();
      globalThis.api.post(internalLoginApiUrl)
        .send(requestBody)
        .expect(status)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                email: requestBody.email
              },
              select: expect.objectContaining({
                email: true,
                power: true,
                password: true,
                reset_password_token: true,
              })
            })
          );
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });
});
