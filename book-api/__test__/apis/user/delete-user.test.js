const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const WebSocketCreator = require('#test/resources/web-socket');
const OutputValidate = require('#services/output-validate');
const UserRoutePath = require('#services/route-paths/user');
const { WsClient, Socket } = require('#services/socket');
const { HTTP_CODE, METHOD, POWER, PATH } = require('#constants');
const { USER, COMMON } = require('#messages');
const { createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const {
  authenticationToken,
  sessionData,
  mockUser,
  signedTestCookie,
  clearAllSession,
  destroySession,
} = require('#test/resources/auth');
const deleteUserId = Date.now().toString();
const deleteUserUrl = `${UserRoutePath.delete.abs}/${deleteUserId}`;

const mockUserWithUserRole = {
  ...mockUser,
  power: 0,
};

const sessionDataWithUserRole = {
  ...sessionData.user,
  role: POWER.USER,
};

const sessionDataWithSuperAdminRole = {
  ...sessionData.user,
  role: POWER.SUPER_ADMIN,
};

const wsSend = jest.fn();

describe('delete user', () => {
  commonTest(
    'delete user api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.CLIENT}/unknown`,
        method: METHOD.DELETE.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: deleteUserUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'delete user api cors',
        url: deleteUserUrl,
        method: METHOD.DELETE.toLowerCase(),
        origin: process.env.CLIENT_ORIGIN_CORS,
      },
    ],
    'delete user common test'
  );

  describe(createDescribeTest(METHOD.DELETE, deleteUserUrl), () => {
    beforeAll(async () => {
      Socket.instance.subscribe();
      await WebSocketCreator.startUp((event, ws) => {
        ws.send(JSON.stringify({ name: 'user', id: deleteUserId }));
      });
      await WebSocketCreator.startUp((event, ws) => {
        ws.send(JSON.stringify({ name: 'user', id: sessionData.userId }));
      });
    });

    afterEach((done) => {
      wsSend.mockReset();
      done();
    });

    afterAll((done) => {
      WebSocketCreator.turnDown();
      done();
    });

    test('delete user will be success with admin - user role', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              const jsonData = JSON.parse(wsSend.mock.calls[0][0]);
              const sendingData = wsClientSend.mock.calls[0][0];
              expect(jsonData).toMatchObject(sendingData);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  power: true,
                },
              });
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  session_id: true,
                },
              });
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                data: {
                  session_id: null,
                },
              });
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
              });
              expect(response.body).toEqual({
                message: USER.DELETE_USER_SUCCESS.format(mockUser.email),
              });
              done();
            });
        });
      });
    });

    test('delete user will be success with super admin - user role', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession().then(() => {
        signedTestCookie(sessionDataWithSuperAdminRole).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              const jsonData = JSON.parse(wsSend.mock.calls[0][0]);
              const sendingData = wsClientSend.mock.calls[0][0];
              expect(jsonData).toMatchObject(sendingData);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  power: true,
                },
              });
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  session_id: true,
                },
              });
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                data: {
                  session_id: null,
                },
              });
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
              });
              expect(response.body).toEqual({
                message: USER.DELETE_USER_SUCCESS.format(mockUser.email),
              });
              done();
            });
        });
      });
    });

    test('delete user will be success with super admin - admin role', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession().then(() => {
        signedTestCookie(sessionDataWithSuperAdminRole).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              const jsonData = JSON.parse(wsSend.mock.calls[0][0]);
              const sendingData = wsClientSend.mock.calls[0][0];
              expect(jsonData).toMatchObject(sendingData);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  power: true,
                },
              });
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  session_id: true,
                },
              });
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                data: {
                  session_id: null,
                },
              });
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
              });
              expect(response.body).toEqual({
                message: USER.DELETE_USER_SUCCESS.format(mockUser.email),
              });
              done();
            });
        });
      });
    });

    test('delete user is still success without ws client regis', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.OK)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  power: true,
                },
              });
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  session_id: true,
                },
              });
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                data: {
                  session_id: null,
                },
              });
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
              });
              expect(response.body).toEqual({
                message: USER.DELETE_USER_SUCCESS.format(mockUser.email),
              });
              done();
            });
        });
      });
    });

    test('delete user failed with authentication token unset', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
      });
    });

    test('delete user failed with session expired', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        destroySession().then((responseSign) => {
          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
      });
    });

    test('delete user failed with user login with role is user', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionDataWithUserRole).then((responseSign) => {
          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_PERMISSION)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.NOT_PERMISSION,
              });
              done();
            });
        });
      });
    });

    test('delete user failed with admin - admin role', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_PERMISSION)
            .then((response) => {
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  user_id: deleteUserId,
                },
                select: {
                  power: true,
                },
              });
              expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.NOT_PERMISSION,
              });
              done();
            });
        });
      });
    });

    test('delete user failed with output validate error', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send').mockReset();

      signedTestCookie(sessionData.user).then((responseSign) => {
        const sessionId = responseSign.body.sessionId;
        globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({
          session_id: sessionId,
        });

        globalThis.api
          .delete(deleteUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                power: true,
              },
            });
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              data: {
                session_id: null,
              },
            });
            expect(globalThis.prismaClient.user.delete).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
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
        status: HTTP_CODE.NOT_FOUND,
        cause: PrismaNotFoundError,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
        cause: ServerError,
      },
    ])('delete user failed with findUniqueOrThrow method throw $describe', ({ expected, status, cause }, done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockRejectedValue(cause);
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue(mockUserWithUserRole);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                power: true,
              },
            });
            expect(globalThis.prismaClient.user.findFirstOrThrow).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
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
        status: HTTP_CODE.NOT_FOUND,
        cause: PrismaNotFoundError,
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
        cause: ServerError,
      },
    ])('delete user failed with findFirstOrThrow method throw $describe', ({ expected, status, cause }, done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.user.findFirstOrThrow.mockRejectedValue(cause);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .delete(deleteUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                power: true,
              },
            });
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
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
    ])('delete user failed with update method throw $describe', ({ cause, expected, status }, done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      globalThis.prismaClient.user.update.mockRejectedValue(cause);
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');

      signedTestCookie(sessionData.user).then((responseSign) => {
        const sessionId = responseSign.body.sessionId;
        globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({ session_id: sessionId });

        globalThis.api
          .delete(deleteUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                power: true,
              },
            });
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              data: {
                session_id: null,
              },
            });
            expect(globalThis.prismaClient.user.delete).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
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
    ])('delete user failed with delete method throw $describe', ({ expected, status, cause }, done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      globalThis.prismaClient.user.delete.mockRejectedValue(cause);
      globalThis.prismaClient.user.update.mockResolvedValue(mockUser);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');

      signedTestCookie(sessionData.user).then((responseSign) => {
        const sessionId = responseSign.body.sessionId;
        globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({ session_id: sessionId });

        globalThis.api
          .delete(deleteUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                power: true,
              },
            });
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
              data: {
                session_id: null,
              },
            });
            expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              },
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
