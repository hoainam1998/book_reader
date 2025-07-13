const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const GraphqlResponse = require('#dto/common/graphql-response');
const ErrorCode = require('#services/error-code');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const {
  mockUser,
  authenticationToken,
  sessionData,
  signedTestCookie,
  destroySession,
} = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const updatePowerUrl = UserRoutePath.updatePower.abs;

const requestBody = {
  userId: mockUser.user_id,
  power: true,
};

describe('update power', () => {
  commonTest(
    'update power common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.USER}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: updatePowerUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'update power api cors',
        url: updatePowerUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'update power common test'
  );

  describe(createDescribeTest(METHOD.POST, updatePowerUrl), () => {
    test('update power will be success', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.CREATED)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  user_id: requestBody.userId,
                },
                data: {
                  power: requestBody.power,
                },
              })
            );
            expect(response.body).toEqual({
              message: USER.UPDATE_POWER_SUCCESS.format(mockUser.email),
            });
            done();
          });
      });
    });

    test('update power failed with authentication token unset', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('update power failed with session expired', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('update power failed with user role', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, role: POWER.USER }).then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.NOT_PERMISSION)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.NOT_PERMISSION,
            });
            done();
          });
      });
    });

    test('update power failed request body empty', (done) => {
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send({})
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.UPDATE_POWER_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('update power failed request body missing field', (done) => {
      // missing power field.
      const badRequestBody = {
        userId: requestBody.userId,
      };

      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.UPDATE_POWER_FAIL),
              errors: expect.arrayContaining([expect.any(String)]),
            });
            done();
          });
      });
    });

    test('update power failed output validate failed', (done) => {
      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(() =>
        GraphqlResponse.dto.parse({
          data: {
            message: 'unknown',
          },
        })
      );

      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  user_id: requestBody.userId,
                },
                data: {
                  power: requestBody.power,
                },
              })
            );
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test.each([
      {
        describe: 'user not found',
        cause: PrismaNotFoundError,
        expected: {
          message: USER.USER_NOT_FOUND,
        },
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
    ])('update failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.user.update.mockRejectedValue(cause);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(updatePowerUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
              expect.objectContaining({
                where: {
                  user_id: requestBody.userId,
                },
                data: {
                  power: requestBody.power,
                },
              })
            );
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
