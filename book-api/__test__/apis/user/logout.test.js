const TestServer = require('#test/resources/test-server');
const commonTest = require('#test/apis/common/index');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER } = require('#messages');
const { authenticationToken, mockUser } = require('#test/resources/auth');
const authentication = require('#middlewares/auth/authentication');
const logoutUrl = `${PATH.USER}/logout`;
let api;

require('#test/apis/common/authentication.test');

commonTest('logout api common test', [
  {
    name: 'url test',
    describe: 'url is invalid',
    url: `${PATH.USER}/unknown`,
    method: METHOD.POST.toLowerCase(),
  },
  {
    name: 'method test',
    describe: 'method not allowed',
    url: logoutUrl,
    method: METHOD.POST.toLowerCase(),
  },
  {
    name: 'cors test',
    describe: 'login api cors',
    url: logoutUrl,
    method: METHOD.GET.toLowerCase(),
    origin: process.env.ORIGIN_CORS
  }
], 'logout common test');

describe('logout api test', () => {
  beforeAll((done) => {
    TestServer.addMiddleware((request) => {
      request.session.user = {
        email: mockUser.email,
        mafEnable: mockUser.mfa_enable,
        apiKey: authenticationToken,
        power: mockUser.power,
      };
    });

    api = TestServer.startTestServer(done, 'logout');
  });

  afterAll((done) => {
    TestServer.removeTestMiddleware();
    TestServer.closeTestServer(done, 'logout');
  });

  test('logout will be success', (done) => {
    api.get(logoutUrl)
      .set('authorization', authenticationToken)
      .expect(HTTP_CODE.OK)
      .expect('Content-Type', /application\/json/)
      .then((response) => {
        expect(response.body).toMatchObject({
          message: USER.LOGOUT_SUCCESS
        });
        done();
      });
  }, 1000);
});
