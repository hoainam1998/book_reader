const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const WebSocketCreator = require('#test/resources/web-socket');
const GraphqlResponse = require('#dto/common/graphql-response');
const { WsClient, Socket } = require('#services/socket');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const { authenticationToken, sessionData, mockUser, signedTestCookie, clearAllSession, destroySession } = require('#test/resources/auth');
const deleteUserId = Date.now().toString();
const deleteUserUrl = `${PATH.USER}/delete/${deleteUserId}`;

const wsSend = jest.fn();

describe('delete user', () => {
  describe(createDescribeTest(METHOD.DELETE, deleteUserUrl), () => {
    beforeAll(async () => {
      Socket.instance.subscribe();
      await WebSocketCreator.startUp((event, ws) => {
        ws.send(JSON.stringify({ name: 'user', id: sessionData.userId }));
      });
      await WebSocketCreator.startUp((event, ws) => {
        ws.send(JSON.stringify({ name: 'user', id: deleteUserId }));
      });
    });

    afterEach((done) => {
      wsSend.mockReset();
      done();
    });

    test('delete user will be success', (done) => {
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession()
        .then(() => {
          signedTestCookie(sessionData.user)
            .then((responseSign) => {
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
                  expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
                  expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
                    where: {
                      user_id: deleteUserId
                    },
                    select: {
                      session_id: true,
                    }
                  });
                  expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
                  expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
                    where: {
                      user_id: deleteUserId
                    },
                    data: {
                      session_id: null,
                    }
                  });
                  expect(globalThis.prismaClient.user.delete).toHaveBeenCalledTimes(1);
                  expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
                    where: {
                      user_id: deleteUserId,
                    }
                  });
                  expect(response.body).toEqual({
                    message: USER.DELETE_USER_SUCCESS.format(mockUser.email)
                  });
                  done();
                });
            });
          });
    });

    test('delete user is still success without ws client regis', (done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.user.delete.mockResolvedValue(mockUser);
      globalThis.prismaClient.user.update.mockResolvedValue();

      expect.hasAssertions();
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession()
        .then(() => {
          signedTestCookie(sessionData.user)
            .then((responseSign) => {
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
                  expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledTimes(1);
                  expect(globalThis.prismaClient.user.findFirstOrThrow).toHaveBeenCalledWith({
                    where: {
                      user_id: deleteUserId
                    },
                    select: {
                      session_id: true,
                    }
                  });
                  expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
                  expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith({
                    where: {
                      user_id: deleteUserId
                    },
                    data: {
                      session_id: null,
                    }
                  });
                  expect(globalThis.prismaClient.user.delete).toHaveBeenCalledTimes(1);
                  expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
                    where: {
                      user_id: deleteUserId,
                    }
                  });
                  expect(response.body).toEqual({
                    message: USER.DELETE_USER_SUCCESS.format(mockUser.email)
                  });
                  done();
                });
            });
          });
    });

    test('delete user failed with authentication token unset', (done) => {
      expect.hasAssertions();

      clearAllSession()
        .then(() => {
          signedTestCookie(sessionData.user)
            .then((responseSign) => {
              globalThis.api
                .delete(deleteUserUrl)
                .set('Cookie', [responseSign.header['set-cookie']])
                .expect('Content-Type', /application\/json/)
                .expect(HTTP_CODE.UNAUTHORIZED)
                .then((response) => {
                  expect(wsSend).not.toHaveBeenCalled();
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

      clearAllSession()
        .then(() => {
          destroySession()
            .then((responseSign) => {
              globalThis.api
                .delete(deleteUserUrl)
                .set('Cookie', [responseSign.header['set-cookie']])
                .set('authorization', authenticationToken)
                .expect('Content-Type', /application\/json/)
                .expect(HTTP_CODE.UNAUTHORIZED)
                .then((response) => {
                  expect(wsSend).not.toHaveBeenCalled();
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

      clearAllSession()
        .then(() => {
          signedTestCookie({ ...sessionData.user, role: POWER.USER })
            .then((responseSign) => {
              globalThis.api
                .delete(deleteUserUrl)
                .set('Cookie', [responseSign.header['set-cookie']])
                .set('authorization', authenticationToken)
                .expect('Content-Type', /application\/json/)
                .expect(HTTP_CODE.NOT_PERMISSION)
                .then((response) => {
                  expect(wsSend).not.toHaveBeenCalled();
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
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({
          data: {}
        })
      );
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
        cause: PrismaNotFoundError
      },
      {
        describe: 'server error',
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
        cause: ServerError,
      }
    ])('delete user failed with findFirstOrThrow method throw $describe', ({ expected, status, cause }, done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.user.findFirstOrThrow.mockRejectedValue(cause);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .delete(deleteUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect('Content-Type', /application\/json/)
            .expect(status)
            .then((response) => {
              expect(wsClientSend).not.toHaveBeenCalled();
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
      }
    ])('delete user failed with update method throw $describe', ({ cause, expected, status }, done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
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
                user_id: deleteUserId
              },
              data: {
                session_id: null,
              }
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
      }
    ])('delete user failed with delete method throw $describe', ({ expected, status, cause }, done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
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
                user_id: deleteUserId
              },
              data: {
                session_id: null,
              }
            });
            expect(globalThis.prismaClient.user.delete).toHaveBeenCalledWith({
              where: {
                user_id: deleteUserId,
              }
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
