const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ErrorCode = require('#services/error-code');
const WebSocketCreator = require('#test/resources/web-socket');
const OutputValidate = require('#services/output-validate');
const ClientRoutePath = require('#services/route-paths/client');
const ClientDummyData = require('#test/resources/dummy-data/client');
const { WsClient, Socket } = require('#services/socket');
const { HTTP_CODE, METHOD, POWER, PATH } = require('#constants');
const { USER, COMMON, READER } = require('#messages');
const { createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const {
  sessionData,
  authenticationToken,
  signedTestCookie,
  clearAllSession,
  destroySession,
} = require('#test/resources/auth');
const blockUserUrl = ClientRoutePath.block.abs;
const mockClient = ClientDummyData.MockData;

const requestBody = {
  clientId: mockClient.reader_id,
};

const wsSend = jest.fn();

describe('block client', () => {
  commonTest(
    'block client api common test',
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
        describe: 'block client api cors',
        url: blockUserUrl,
        method: METHOD.PUT.toLowerCase(),
        origin: process.env.CLIENT_ORIGIN_CORS,
      },
    ],
    'block client common test'
  );

  describe(createDescribeTest(METHOD.DELETE, blockUserUrl), () => {
    beforeAll((done) => {
      Socket.instance.subscribe();
      WebSocketCreator.startUp((event, ws) => {
        ws.send(JSON.stringify({ name: 'client', id: mockClient.reader_id }));
        done();
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

    test('block reader will be success', (done) => {
      expect.hasAssertions();
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.reader.findUniqueOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.CREATED)
            .then((response) => {
              const jsonData = JSON.parse(wsSend.mock.calls[0][0]);
              const sendingData = wsClientSend.mock.calls[0][0];
              expect(jsonData).toMatchObject(sendingData);
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  reader_id: requestBody.clientId,
                },
                select: {
                  session_id: true,
                },
              });
              expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(2);
              expect(globalThis.prismaClient.reader.update.mock.calls).toEqual([
                [
                  {
                    where: {
                      reader_id: requestBody.clientId,
                    },
                    data: {
                      session_id: null,
                    },
                  },
                ],
                [
                  {
                    where: {
                      reader_id: requestBody.clientId,
                    },
                    data: {
                      blocked: 1,
                    },
                  },
                ],
              ]);
              expect(response.body).toEqual({
                message: READER.BLOCK_CLIENT_SUCCESS,
              });
              done();
            });
        });
      });
    });

    test('block client is still success without ws client regis', (done) => {
      expect.hasAssertions();
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      jest.spyOn(WsClient.prototype, 'Ws', 'get').mockImplementation(() => ({ send: wsSend }));

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          const sessionId = responseSign.body.sessionId;
          globalThis.prismaClient.reader.findUniqueOrThrow.mockResolvedValue({ session_id: sessionId });

          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.CREATED)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                  reader_id: requestBody.clientId,
                },
                select: {
                  session_id: true,
                },
              });
              expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(2);
              expect(globalThis.prismaClient.reader.update.mock.calls).toEqual([
                [
                  {
                    where: {
                      reader_id: requestBody.clientId,
                    },
                    data: {
                      session_id: null,
                    },
                  },
                ],
                [
                  {
                    where: {
                      reader_id: requestBody.clientId,
                    },
                    data: {
                      blocked: 1,
                    },
                  },
                ],
              ]);
              expect(response.body).toEqual({
                message: READER.BLOCK_CLIENT_SUCCESS,
              });
              done();
            });
        });
      });
    });

    test('block client failed with authentication token unset', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie(sessionData.user).then((responseSign) => {
          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
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

    test('block client failed with session expired', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        destroySession().then((responseSign) => {
          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
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

    test('block client failed with user login with role is user', (done) => {
      expect.hasAssertions();

      clearAllSession().then(() => {
        signedTestCookie({ ...sessionData.user, role: POWER.USER }).then((responseSign) => {
          globalThis.api
            .put(blockUserUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .send(requestBody)
            .expect('Content-Type', /application\/json/)
            .expect(HTTP_CODE.NOT_PERMISSION)
            .then((response) => {
              expect(wsSend).not.toHaveBeenCalled();
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

    test('block client failed with output validate error', (done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send').mockReset();

      signedTestCookie(sessionData.user).then((responseSign) => {
        const sessionId = responseSign.body.sessionId;
        globalThis.prismaClient.user.findFirstOrThrow.mockResolvedValue({
          session_id: sessionId,
        });

        globalThis.api
          .put(blockUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                reader_id: requestBody.clientId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(2);
            expect(globalThis.prismaClient.reader.update.mock.calls).toEqual([
              [
                {
                  where: {
                    reader_id: requestBody.clientId,
                  },
                  data: {
                    session_id: null,
                  },
                },
              ],
              [
                {
                  where: {
                    reader_id: requestBody.clientId,
                  },
                  data: {
                    blocked: 1,
                  },
                },
              ],
            ]);
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
    ])('block client failed with findFirstOrThrow method throw $describe', ({ expected, status, cause }, done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.reader.findUniqueOrThrow.mockRejectedValue(cause);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');

      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .put(blockUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                reader_id: requestBody.clientId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
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
    ])('block client failed with update method throw $describe', ({ cause, expected, status }, done) => {
      jest.spyOn(Socket.prototype, 'Clients', 'get').mockImplementation(() => new Map());
      globalThis.prismaClient.reader.update.mockRejectedValue(cause);
      const wsClientSend = jest.spyOn(WsClient.prototype, 'send');

      signedTestCookie(sessionData.user).then((responseSign) => {
        const sessionId = responseSign.body.sessionId;
        globalThis.prismaClient.reader.findUniqueOrThrow.mockResolvedValue({ session_id: sessionId });

        globalThis.api
          .put(blockUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .send(requestBody)
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
            expect(wsClientSend).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                reader_id: requestBody.clientId,
              },
              select: {
                session_id: true,
              },
            });
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
              where: {
                reader_id: requestBody.clientId,
              },
              data: {
                session_id: null,
              },
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
