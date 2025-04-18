require('#test/mocks/node-fetch');
const fetch = require('node-fetch');
const prismaClientMock = require('#test/mocks/prisma-client');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const TestServer = require('#test/resources/test-server');
const { plainToInstance } = require('class-transformer');
const UserDTO = require('#dto/user/user');
const GraphqlResponse = require('#dto/common/graphql-response');
const prismaClient = require('#services/prisma-client');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const commonTest = require('#test/apis/common/index');
const { mockUser } = require('#test/resources/auth');
const { passwordHashing } = require('#utils');
const loginUrl = `${PATH.USER}/login`;
let api;

const requestBody = {
  email: mockUser.email,
  password: mockUser.password,
  query: {
    name: true,
    apiKey: true,
    avatar: true,
    email: true,
    mfaEnable: true,
  },
};

let sessionToken = null;

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

describe('login api test', () => {
  beforeAll((done) => {
    api = TestServer.startTestServer(done, 'login');
  });

  afterAll((done) => TestServer.closeTestServer(done, 'login'));

  afterEach(() => {
    prismaClientMock.resetAllMocks();
    fetch.mockReset();
  });

  test('login success', (done) => {
    fetch.mockResolvedValue(new Response(JSON.stringify({
      name: 'nguyen nam',
      email: 'namdang201999@gmail.com',
      avatar: 'avatar',
      mfaEnable: true,
      apiKey: null,
      power: 0,
    })));

    api.post(loginUrl)
      .send(requestBody)
      .expect(HTTP_CODE.OK)
      .expect('Content-Type', /application\/json/)
      .then((response) => {
        const plainUser = plainToInstance(UserDTO, mockUser);
        expect(response.body.apiKey).toBeDefined();
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/user/login-process'), expect.anything());
        expect(response.body).toHaveProperty('name', plainUser.name);
        expect(response.body).toHaveProperty('avatar', plainUser.avatar);
        expect(response.body).toHaveProperty('email', plainUser.email);
        expect(response.body).toHaveProperty('mfaEnable', plainUser.mfaEnable);
        sessionToken = response.header['set-cookie'];
        done();
      });
  }, 1000);

  test('login failed when user already login', (done) => {
    api.post(loginUrl)
      .set('Cookie', [sessionToken])
      .send(requestBody)
      .then((response) => {
        expect(fetch).not.toHaveBeenCalled();
        expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
        expect(response.header['content-type']).toContain('application/json;');
        expect(response.body).toMatchObject({
           message: USER.ALREADY_LOGIN
        });
        done();
      });
    sessionToken = null;
  }, 1000);

  test.each([
    {
      title: 'login failed with bad request',
      expected: {
        message: `${USER.LOGIN_FAIL}\n${COMMON.INPUT_VALIDATE_FAIL}`,
        errors: [],
      },
      status: HTTP_CODE.BAD_REQUEST
    },
    {
      title: 'login failed failed with output validated error',
      expected: {
        message: COMMON.OUTPUT_VALIDATE_FAIL,
      },
      status: HTTP_CODE.BAD_REQUEST
    },
    {
      title: 'login failed with user not found',
      expected: {
        message: USER.USER_NOT_FOUND
      },
      status: HTTP_CODE.UNAUTHORIZED
    },
    {
      title: 'login failed with failed with server error',
      expected: {
        message: COMMON.INTERNAL_ERROR_MESSAGE
      },
      status: HTTP_CODE.SERVER_ERROR
    }
  ])('$title', ({ expected, status }, done) => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify(expected), { status })
    );

    api.post(loginUrl)
      .send(requestBody)
      .expect(status)
      .then((response) => {
        expect(fetch).toHaveBeenCalled();
        expect(response.body).toMatchObject(expected);
        done();
      });
  }, 1000);
});

commonTest('login internal api common test', [
  {
    name: 'cors test',
    describe: 'login api cors',
    url: loginUrl,
    method: METHOD.POST.toLowerCase(),
    origin: process.env.ORIGIN_CORS
  }
], 'login internal');

describe('login api testing with internal api', () => {
  beforeAll((done) => {
    api = TestServer.startTestServer(done, 'login internal');
  });

  afterAll((done) => TestServer.closeTestServer(done, 'login'));

  afterEach(() => {
    prismaClientMock.resetAllMocks();
    jest.restoreAllMocks();
  });

  const internalLoginApiUrl = `${PATH.USER}/login-process`;

  test('login internal api will be success', async () => {
    const passwordHash = await passwordHashing(mockUser.password);

    prismaClient.user.findFirstOrThrow.mockResolvedValue({
      ...mockUser,
      password: passwordHash,
    });

    const response = await api.post(internalLoginApiUrl).send(requestBody);

    const plainUser = plainToInstance(UserDTO, mockUser);
    expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalled();
    expect(response.body).toHaveProperty('name', plainUser.name);
    expect(response.body).toHaveProperty('avatar', plainUser.avatar);
    expect(response.body).toHaveProperty('email', plainUser.email);
    expect(response.body).toHaveProperty('mfaEnable', plainUser.mfaEnable);
  });

  test('login internal api failed with bad request', (done) => {
    api.post(internalLoginApiUrl)
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

  test('login internal api failed with output validated error', async () => {
    const passwordHash = await passwordHashing(mockUser.password);
    jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
      () => GraphqlResponse.dto.parse({ data: { email: 'unknown9@gmail.com' }, response: {} })
    );

    prismaClient.user.findFirstOrThrow.mockResolvedValue({
      ...mockUser,
      password: passwordHash,
    });

    const response = await api.post(internalLoginApiUrl).send(requestBody);

      expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(response.body).toMatchObject({
        message: COMMON.OUTPUT_VALIDATE_FAIL
      });
  });

  test.each([
    {
      title: 'with user not found',
      expected: {
        message: USER.USER_NOT_FOUND
      },
      cause_error: new PrismaClientKnownRequestError('Record not found!', { code: 'P2025' }),
      status: HTTP_CODE.UNAUTHORIZED
    },
    {
      title: 'with server error',
      expected: {
        message: COMMON.INTERNAL_ERROR_MESSAGE
      },
      case_error: new Error('Server error!'),
      status: HTTP_CODE.SERVER_ERROR
    }
  ])('login internal api failed $title', ({ expected, status, cause_error }, done) => {
    prismaClient.user.findFirstOrThrow.mockRejectedValue(cause_error);

    api.post(internalLoginApiUrl)
      .send(requestBody)
      .expect(status)
      .expect('Content-Type', /application\/json/)
      .then((response) => {
        expect(prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
        expect(response.body).toMatchObject(expected);
        done();
      });
  });
});
