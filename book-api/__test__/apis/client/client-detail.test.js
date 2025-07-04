const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const OutputValidate = require('#services/output-validate');
const ClientDummyData = require('#test/resources/dummy-data/client');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ClientRoutePath = require('#services/route-paths/client');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
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
      name: true
    },
    readLate: {
      name: true
    },
    usedRead: {
      name: true
    }
  }
};

describe('client detail', () => {
  commonTest('client detail api common test', [
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
    }
  ], 'client detail common test');

  describe(createDescribeTest(METHOD.POST, clientDetailUrl), () => {
    test('get client detail will be success', (done) => {
      const clientDetailExpected = ClientDummyData.generateExpectedObject(requestBody.query);
      globalThis.prismaClient.reader.findUniqueOrThrow.mockResolvedValue(mockClient);

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(clientDetailUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    reader_id: sessionData.clientId,
                  },
                  select: selectExpected,
                })
              );
              expect(response.body).toEqual(clientDetailExpected);
              done();
            });
        });
    });

    test('get client detail failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(clientDetailUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('get client detail failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(clientDetailUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('get client detail failed with request body empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(clientDetailUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send({})
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(READER.LOAD_DETAIL_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('get client detail failed with undefine request body field', (done) => {
      const undefineField = 'clientId';
      const badRequestBody = {
        [undefineField]: sessionData.clientId,
        query: requestBody.query,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(clientDetailUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(badRequestBody)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(READER.LOAD_DETAIL_FAIL),
                errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
              });
              done();
            });
        });
    });

    test('get client detail failed with output validate error', (done) => {
      globalThis.prismaClient.reader.findUniqueOrThrow.mockResolvedValue(mockClient);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(clientDetailUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    reader_id: sessionData.clientId
                  },
                  select: selectExpected,
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
        describe: 'not found error',
        expected: {
          message: READER.USER_NOT_FOUND
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
      }
    ])('get client detail failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.reader.findUniqueOrThrow.mockRejectedValue(cause);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(clientDetailUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .send(requestBody)
            .expect(status)
            .expect('Content-Type', /application\/json/)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findUniqueOrThrow).toHaveBeenCalledWith(
                expect.objectContaining({
                  where: {
                    reader_id: sessionData.clientId,
                  },
                  select: selectExpected,
                })
              );
              expect(response.body).toEqual(expected);
              done();
            });
        });
    });
  });
});
