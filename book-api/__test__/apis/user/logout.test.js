const commonTest = require('#test/apis/common/common');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie } = require('#test/resources/auth');
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
    test('logout will be success', (done) => {
      expect.hasAssertions();

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api.get(logoutUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: sessionData.user.userId
                },
                select: {
                  session_id: true,
                }
              });
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
                where: {
                  user_id: sessionData.user.userId
                },
                data: {
                  session_id: null
                }
              });
              expect(response.body).toEqual({
                message: USER.LOGOUT_SUCCESS,
              });
            done();
          });
        });
    });
  });
});
