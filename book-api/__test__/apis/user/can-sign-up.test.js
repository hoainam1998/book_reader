const { ServerError } = require('#test/mocks/other-errors');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD } = require('#constants');
const { COMMON } = require('#messages');
const commonTest = require('#test/apis/common/common');
const { createDescribeTest } = require('#test/helpers/index');
const canSignUpUrl = UserRoutePath.canSignup.abs;

describe('can signup', () => {
  commonTest(
    'can signup internal api common test',
    [
      {
        name: 'cors test',
        describe: 'can signup internal api cors',
        url: canSignUpUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'can signup internal'
  );

  describe(createDescribeTest(METHOD.POST, canSignUpUrl), () => {
    test('can signup admin user will be success', (done) => {
      globalThis.prismaClient.user.count.mockResolvedValue(0);

      expect.hasAssertions();
      globalThis.api
        .get(canSignUpUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.OK)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(response.body).toBe(true);
          done();
        });
    });

    test('can signup admin user failed', (done) => {
      globalThis.prismaClient.user.count.mockResolvedValue(1);

      expect.hasAssertions();
      globalThis.api
        .get(canSignUpUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.OK)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(response.body).toBe(false);
          done();
        });
    });

    test('can signup admin user failed with server error', (done) => {
      globalThis.prismaClient.user.count.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .get(canSignUpUrl)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });
  });
});
