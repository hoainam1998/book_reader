const commonTest = require('#test/apis/common/common');
const ClientRoutePath = require('#services/route-paths/client');
const ClientDummyData = require('#test/resources/dummy-data/client');
const ErrorCode = require('#services/error-code');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER } = require('#messages');
const { signedTestCookie } = require('#test/resources/auth');
const { createDescribeTest } = require('#test/helpers/index');
const logoutUrl = ClientRoutePath.logout.abs;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;

describe('logout api', () => {
  commonTest(
    'logout api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.USER}/unknown`,
        method: METHOD.GET.toLowerCase(),
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
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'logout common test'
  );

  describe(createDescribeTest(METHOD.GET, logoutUrl), () => {
    test('logout failed due without login', (done) => {
      expect.hasAssertions();
      globalThis.api
        .get(logoutUrl)
        .set('authorization', apiKey)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.reader.findUniqueOrThrow).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.reader.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.USER_UNAUTHORIZED,
            errorCode: ErrorCode.HAVE_NOT_LOGIN,
          });
          done();
        });
    });

    test('logout will be success', (done) => {
      expect.hasAssertions();

      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .get(logoutUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', apiKey)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                reader_id: sessionData.clientId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
              where: {
                reader_id: sessionData.clientId,
              },
              data: {
                session_id: null,
              },
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
