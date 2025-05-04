const commonTest = require('#test/apis/common/common');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER } = require('#messages');
const { authenticationToken, mockUser } = require('#test/resources/auth');
const { createDescribeTest } = require('#test/helpers/index');
const logoutUrl = `${PATH.USER}/logout`;
describe('logout api', () => {
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

  describe(createDescribeTest(METHOD.GET, logoutUrl), () => {
    beforeAll((done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          email: mockUser.email,
          mfaEnable: mockUser.mfa_enable,
          apiKey: authenticationToken,
          power: mockUser.power,
        };
      });
      done();
    });

    afterAll((done) => TestServer.removeTestMiddleware(done));

    test('logout will be success', (done) => {
      globalThis.api.get(logoutUrl)
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
});
