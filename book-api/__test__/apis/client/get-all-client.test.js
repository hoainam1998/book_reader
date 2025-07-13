const { ServerError } = require('#test/mocks/other-errors');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ClientDummyData = require('#test/resources/dummy-data/client');
const ClientRoutePath = require('#services/route-paths/client');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { USER, READER, COMMON } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const allClientUrl = ClientRoutePath.all.abs;
const mockClient = ClientDummyData.MockData;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey;

const requestBody = {
  query: {
    clientId: true,
    avatar: true,
    sex: true,
    phone: true,
    name: true,
  },
};

const clientLength = 2;

describe('get all client', () => {
  commonTest(
    'get all client api common test',
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
        url: allClientUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'get all client api cors',
        url: allClientUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'get all client common test'
  );

  describe(createDescribeTest(METHOD.POST, allClientUrl), () => {
    test('get all client success', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const clientExpectedList = ClientDummyData.generateClientExpectedList(requestBody.query, clientLength);
      globalThis.prismaClient.reader.findMany.mockResolvedValue(ClientDummyData.createMockClientList(clientLength));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({ select: selectExpected });
            expect(response.body).toEqual(clientExpectedList);
            expect(response.body).toHaveLength(clientLength);
            done();
          });
      });
    });

    test('get all client success with exclude id', (done) => {
      const requestBodyWithExcludeId = {
        ...requestBody,
        exclude: mockClient.reader_id,
      };

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const clientExpectedList = ClientDummyData.generateClientExpectedList(requestBody.query, clientLength);
      globalThis.prismaClient.reader.findMany.mockResolvedValue(ClientDummyData.createMockClientList(clientLength));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBodyWithExcludeId)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({
              select: selectExpected,
              where: {
                reader_id: {
                  not: requestBodyWithExcludeId.exclude,
                },
              },
            });
            expect(response.body).toEqual(clientExpectedList);
            expect(response.body).toHaveLength(clientLength);
            done();
          });
      });
    });

    test('get all client failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('get all client failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('get all client failed with clients not found', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.reader.findMany.mockResolvedValue([]);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({ select: selectExpected });
            expect(response.body).toEqual([]);
            done();
          });
      });
    });

    test('get all client failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send({})
          .then((response) => {
            expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(READER.LOAD_ALL_CLIENT_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('get all client failed with undefined request body field', (done) => {
      const undefineField = 'clientIds';
      const badRequestBody = {
        [undefineField]: [sessionData.clientId],
        query: requestBody.query,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(badRequestBody)
          .then((response) => {
            expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(READER.LOAD_ALL_CLIENT_FAIL),
              errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
            });
            done();
          });
      });
    });

    test('get all client failed with output validate error', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.reader.findMany.mockResolvedValue(ClientDummyData.createMockClientList(clientLength));
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({ select: selectExpected });
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('get all client failed with server error', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.reader.findMany.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client').then((responseSign) => {
        globalThis.api
          .post(allClientUrl)
          .set('authorization', apiKey)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({ select: selectExpected });
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
