const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const RedisClient = require('#services/redis-client/redis');
const OutputValidate = require('#services/output-validate');
const ClientDummyData = require('#test/resources/dummy-data/client');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ClientRoutePath = require('#services/route-paths/client');
const { HTTP_CODE, METHOD, PATH, REDIS_KEYS } = require('#constants');
const { USER, COMMON, READER } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');

const clientDetailUrl = ClientRoutePath.detail.abs;
const mockClient = ClientDummyData.MockData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;

const requestBody = {
  query: {
    firstName: true,
    lastName: true,
    avatar: true,
    email: true,
    sex: true,
    favoriteBooks: {
      name: true,
      avatar: true,
      bookId: true,
      authors: {
        name: true,
        authorId: true,
      },
    },
    readLate: {
      avatar: true,
      bookId: true,
      authors: {
        name: true,
        authorId: true,
      },
      createAt: true,
    },
    usedRead: {
      avatar: true,
      bookId: true,
      authors: {
        name: true,
        authorId: true,
      },
      createAt: true,
    },
  },
};

describe('client detail', () => {
  commonTest(
    'client detail api common test',
    [
      {
        name: 'url test',
        describe: 'url is invalid',
        url: `${PATH.CLIENT}/unknown`,
        method: METHOD.POST.toLowerCase(),
      },
      {
        name: 'method test',
        describe: 'method not allowed',
        url: clientDetailUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'client detail api cors',
        url: clientDetailUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.CLIENT_ORIGIN_CORS,
      },
    ],
    'client detail common test'
  );

  describe(createDescribeTest(METHOD.POST, clientDetailUrl), () => {
    test('get client detail will be success from cache data', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue([mockClient]);
      const clientDetailExpected = ClientDummyData.generateExpectedObject(requestBody.query);
      RedisClient.Instance.Client.exists.mockResolvedValue(1);
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue(mockClient);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`);
            expect(jsonGet).toHaveBeenCalledTimes(1);
            expect(jsonGet).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`, { path: '$' });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(response.body).toEqual(clientDetailExpected);
            done();
          });
      });
    });

    test('get client detail will be success from database', (done) => {
      const clientDetailExpected = ClientDummyData.generateExpectedObject(requestBody.query);
      RedisClient.Instance.Client.exists.mockResolvedValue(0);
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue(mockClient);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledWith(
              `${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`
            );
            expect(jsonGet).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
              where: {
                OR: [
                  {
                    email: mockClient.reader_id,
                  },
                  {
                    reader_id: mockClient.reader_id,
                  },
                ],
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`);
            expect(jsonSet).toHaveBeenCalledTimes(1);
            expect(jsonSet).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`, '$', mockClient);
            expect(response.body).toEqual(clientDetailExpected);
            done();
          });
      });
    });

    test('get client detail failed with authentication token unset', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.exists).not.toHaveBeenCalled();
            expect(jsonGet).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('get client detail failed with session expired', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();

      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.exists).not.toHaveBeenCalled();
            expect(jsonGet).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('get client detail failed with request body empty', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send({})
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.exists).not.toHaveBeenCalled();
            expect(jsonGet).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(READER.LOAD_DETAIL_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('get client detail failed with undefine request body field', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();

      const undefineField = 'clientId';
      const badRequestBody = {
        [undefineField]: sessionData.clientId,
        query: requestBody.query,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.exists).not.toHaveBeenCalled();
            expect(jsonGet).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(READER.LOAD_DETAIL_FAIL),
              errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
            });
            done();
          });
      });
    });

    test('get client detail failed with output validate error', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue([mockClient]);
      RedisClient.Instance.Client.exists.mockResolvedValue(1);
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue(mockClient);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`);
            expect(jsonGet).toHaveBeenCalledTimes(1);
            expect(jsonGet).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`, { path: '$' });
            expect(jsonSet).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('get client detail failed with exits method got server error', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();
      RedisClient.Instance.Client.exists.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledWith(
              `${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`
            );
            expect(jsonGet).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test('get client detail failed with json.get method got server error', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockRejectedValue(ServerError);
      RedisClient.Instance.Client.exists.mockResolvedValue(1);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledWith(
              `${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`
            );
            expect(jsonGet).toHaveBeenCalledTimes(1);
            expect(jsonGet).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`, { path: '$' });
            expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });

    test.each([
      {
        describe: 'not found error',
        expected: {
          message: READER.USER_NOT_FOUND,
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
    ])('get client detail failed with findFirstOrThrow got $describe', ({ cause, expected, status }, done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();
      RedisClient.Instance.Client.exists.mockResolvedValue(0);
      globalThis.prismaClient.reader.findFirstOrThrow.mockRejectedValue(cause);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(status)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledWith(
              `${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`
            );
            expect(jsonGet).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
              where: {
                OR: [
                  {
                    email: mockClient.reader_id,
                  },
                  {
                    reader_id: mockClient.reader_id,
                  },
                ],
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).not.toHaveBeenCalled();
            expect(jsonSet).not.toHaveBeenCalled();
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });

    test('get client detail failed with del method got server error', (done) => {
      const jsonSet = jest.spyOn(RedisClient.Instance.Client.json, 'set').mockResolvedValue();
      const jsonGet = jest.spyOn(RedisClient.Instance.Client.json, 'get').mockResolvedValue();
      RedisClient.Instance.Client.del.mockRejectedValue(ServerError);
      RedisClient.Instance.Client.exists.mockResolvedValue(0);
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue(mockClient);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(clientDetailUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.exists).toHaveBeenCalledWith(
              `${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`
            );
            expect(jsonGet).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
              where: {
                OR: [
                  {
                    email: mockClient.reader_id,
                  },
                  {
                    reader_id: mockClient.reader_id,
                  },
                ],
              },
              select: selectExpected,
            });
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledTimes(1);
            expect(RedisClient.Instance.Client.del).toHaveBeenCalledWith(`${REDIS_KEYS.CLIENT}:${mockClient.reader_id}`);
            expect(jsonSet).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
