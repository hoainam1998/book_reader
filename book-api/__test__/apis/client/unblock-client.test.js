const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError, PrismaDataValidationError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const OutputValidate = require('#services/output-validate');
const ClientRoutePath = require('#services/route-paths/client');
const ClientDummyData = require('#test/resources/dummy-data/client');
const { HTTP_CODE, METHOD, POWER, PATH, BLOCK } = require('#constants');
const { USER, COMMON, READER } = require('#messages');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const {
  sessionData,
  authenticationToken,
  signedTestCookie,
  clearAllSession,
  destroySession,
} = require('#test/resources/auth');
const mockClient = ClientDummyData.MockData;
const clientId = mockClient.reader_id;
const blockUserUrl = `${ClientRoutePath.unblock.abs}/${mockClient.reader_id}`;

const sessionDataWithUserRole = {
  ...sessionData.user,
  role: POWER.USER,
};

describe('unblock client', () => {
  commonTest(
    'unblock client api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.CLIENT}/unknown`,
        method: METHOD.PUT.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: blockUserUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'unblock client api cors',
        url: blockUserUrl,
        method: METHOD.PUT.toLowerCase(),
        origin: process.env.CLIENT_ORIGIN_CORS,
      },
    ],
    'unblock client common test'
  );

  describe(createDescribeTest(METHOD.DELETE, blockUserUrl), () => {

    test('unblock reader will be success', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.reader.findUniqueOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.CREATED)
            .then((response) => {
              expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
                where: {
                  reader_id: clientId,
                },
                data: {
                  blocked: BLOCK.OFF,
                },
              });
              expect(response.body).toEqual({
                message: READER.UNBLOCK_CLIENT_SUCCESS,
              });
              done();
            });
        });
      });
    });

    test('unblock client failed with authentication token unset', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
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
      });
    });

    test('unblock client failed with session expired', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        destroySession().then((responseSign) => {
          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
      });
    });

    test('unblock client failed with invalid request param', (done) => {
      expect.hasAssertions();
      const unblockUserUrlWithInvalidRequestParam = `${ClientRoutePath.unblock.abs}/unknown`;

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .put(unblockUserUrlWithInvalidRequestParam)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(READER.UNBLOCK_CLIENT_FAIL),
                errors: expect.arrayContaining([expect.any(String)]),
              });
              done();
            });
        });
      })
    });

    test('unblock client failed with user login with role is user', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionDataWithUserRole).then((responseSign) => {
          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_PERMISSION)
            .then((response) => {
              expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.NOT_PERMISSION,
              });
              done();
            });
        });
      });
    });

    test('unblock client failed with invalid unblock state', (done) => {
      expect.hasAssertions();
      globalThis.prismaClient.reader.update.mockRejectedValue(
        new PrismaDataValidationError(READER.BLOCK_STATE_INVALID)
      );

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', responseSign.header['set-cookie'])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.BAD_REQUEST)
            .then((response) => {
              expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
                where: {
                  reader_id: clientId,
                },
                data: {
                  blocked: BLOCK.OFF,
                },
              });
              expect(response.body).toEqual({
                message: READER.BLOCK_STATE_INVALID,
              });
              done();
            });
        });
      });
    });

    test('unblock client failed with output validate error', (done) => {
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      globalThis.prismaClient.reader.update.mockResolvedValue(mockClient);

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(blockUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
              where: {
                reader_id: clientId,
              },
              data: {
                blocked: BLOCK.OFF,
              },
            });
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });


    test.each([
      {
        describe: 'not found error',
        expected: {
          message: USER.USER_NOT_FOUND,
        },
        cause: PrismaNotFoundError,
        status: HTTP_CODE.NOT_FOUND,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
        cause: ServerError,
      },
    ])('unblock client failed with update method throw $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.reader.update.mockRejectedValue(cause);

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(blockUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
              where: {
                reader_id: clientId,
              },
              data: {
                blocked: BLOCK.OFF,
              },
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
