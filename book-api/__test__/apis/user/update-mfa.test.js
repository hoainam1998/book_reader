const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const GraphqlResponse = require('#dto/common/graphql-response');
const ErrorCode = require('#services/error-code');
const { HTTP_CODE, PATH, METHOD, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, authenticationToken, sessionData } = require('#test/resources/auth');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const updateMfaUrl = `${PATH.USER}/update-mfa`;

const requestBody = {
  userId: mockUser.user_id,
  mfaEnable: mockUser.mfa_enable,
};

describe('update mfa', () => {
  commonTest('update mfa api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: updateMfaUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'update mfa api cors',
      url: updateMfaUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'update mfa common test');

  describe(createDescribeTest(METHOD.POST, updateMfaUrl), () => {
    test('update mfa will be success', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = sessionData.user;
      });

      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      expect.hasAssertions();
      globalThis.api.post(updateMfaUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect(HTTP_CODE.CREATED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                user_id: requestBody.userId
              },
              data: {
                mfa_enable: requestBody.mfaEnable
              }
            })
          );
          expect(response.body).toEqual({
            message: USER.UPDATE_MFA_STATE_SUCCESS.format(mockUser.email)
          });
          done();
        });
    });

    test('update mfa failed with unauthorized error', (done) => {
      expect.hasAssertions();
      globalThis.api.post(updateMfaUrl)
        .send(requestBody)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.USER_UNAUTHORIZED,
            errorCode: ErrorCode.HAVE_NOT_LOGIN,
          });
          done();
        });
    });

    test('update mfa failed with not permission error', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = {
          ...sessionData.user,
          role: POWER.USER,
        };
      });

      expect.hasAssertions();
      globalThis.api.post(updateMfaUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect(HTTP_CODE.NOT_PERMISSION)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.NOT_PERMISSION
          });
          done();
        });
    });

    test('update mfa failed with request body empty', (done) => {
      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = sessionData.user;
      });

      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      globalThis.api.post(updateMfaUrl)
        .set('authorization', authenticationToken)
        .send({})
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.UPDATE_MFA_STATE_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
          });
          done();
        });
    });

    test('update mfa failed with request body was missed field', (done) => {
      // missing userId field.
      const badRequestBody = {
        mfaEnable: requestBody.mfaEnable
      };

      globalThis.TestServer.addMiddleware((request) => {
        request.session.user = sessionData.user;
      });

      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      globalThis.api.post(updateMfaUrl)
        .set('authorization', authenticationToken)
        .send(badRequestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.UPDATE_MFA_STATE_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
        });
    });

    test('update mfa failed with output validated error', (done) => {
      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({
          data: {
            message: 'unknown'
          }
        })
      );

      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

      expect.hasAssertions();
      globalThis.api.post(updateMfaUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect(HTTP_CODE.BAD_REQUEST)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                user_id: requestBody.userId
              },
              data: {
                mfa_enable: requestBody.mfaEnable
              }
            })
          );
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test.each([
      {
        describe: 'user not found',
        cause: PrismaNotFoundError,
        expected: {
          message: USER.USER_NOT_FOUND
        },
        status: HTTP_CODE.NOT_FOUND
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE
        },
        status: HTTP_CODE.SERVER_ERROR
      }
    ])('update mfa failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.user.update.mockRejectedValue(cause);

      expect.hasAssertions();
      globalThis.api.post(updateMfaUrl)
        .set('authorization', authenticationToken)
        .send(requestBody)
        .expect(status)
        .expect('Content-Type', /application\/json/)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                user_id: requestBody.userId
              },
              data: {
                mfa_enable: requestBody.mfaEnable
              }
            })
          );
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });
});
