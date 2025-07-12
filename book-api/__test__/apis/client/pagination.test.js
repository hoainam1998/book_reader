const { ServerError } = require('#test/mocks/other-errors');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const ClientRoutePath = require('#services/route-paths/client');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { READER, COMMON, USER } = require('#messages');
const { signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { calcPages } = require('#utils');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');

const paginationUrl = ClientRoutePath.pagination.abs;
const sessionData = ClientDummyData.session.client;
const apiKey = ClientDummyData.apiKey

const requestBody = {
  pageSize: 10,
  pageNumber: 1,
  query: {
    clientId: true,
    name: true,
    avatar: true,
    email: true,
    phone: true,
    sex: true,
  },
};

const clientLength = 2;

describe('client pagination', () => {
  commonTest('client pagination api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.CLIENT}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: paginationUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'client pagination api cors',
      url: paginationUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'client pagination common test');

  describe(createDescribeTest(METHOD.POST, paginationUrl), () => {
    test('client pagination success', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        ClientDummyData.createMockClientList(clientLength),
        clientLength,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const clientListExpected = ClientDummyData.generateClientExpectedList(requestBody.query, clientLength);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({
                select: selectExpected,
                orderBy: {
                  reader_id: 'desc'
                },
                take: requestBody.pageSize,
                skip: offset
              });
              expect(globalThis.prismaClient.reader.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: clientListExpected,
                total: clientLength,
                pageSize: requestBody.pageSize,
                page: requestBody.pageNumber,
                pages: calcPages(requestBody.pageSize, clientLength),
              });
              done();
            });
        });
    });

    test('client pagination success with search key', (done) => {
      const requestBodyWithKeyValue = {
        ...requestBody,
        keyword: 'client name'
      };

      globalThis.prismaClient.$transaction.mockResolvedValue([
        ClientDummyData.createMockClientList(clientLength),
        clientLength,
      ]);

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const clientListExpected = ClientDummyData.generateClientExpectedList(requestBodyWithKeyValue.query, clientLength);

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBodyWithKeyValue)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({
                select: selectExpected,
                where: {
                  OR: [
                    {
                      last_name: {
                        contains: requestBodyWithKeyValue.keyword
                      }
                    },
                    {
                      first_name: {
                        contains: requestBodyWithKeyValue.keyword
                      }
                    }
                  ],
                },
                orderBy: {
                  reader_id: 'desc'
                },
                take: requestBody.pageSize,
                skip: offset
              });
              expect(globalThis.prismaClient.reader.count).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.count).toHaveBeenCalledWith({
                where: {
                  OR: [
                    {
                      last_name: {
                        contains: requestBodyWithKeyValue.keyword
                      }
                    },
                    {
                      first_name: {
                        contains: requestBodyWithKeyValue.keyword
                      }
                    }
                  ]
                }
              });
              expect(response.body).toEqual({
                list: clientListExpected,
                total: clientLength,
                pageSize: requestBody.pageSize,
                page: requestBody.pageNumber,
                pages: calcPages(requestBody.pageSize, clientLength),
              });
              done();
            });
        });
    });

    test('client pagination failed clients are empty', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        [],
        0,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', apiKey)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.NOT_FOUND)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({
                select: selectExpected,
                orderBy: {
                  reader_id: 'desc'
                },
                take: requestBody.pageSize,
                skip: offset
              });
              expect(globalThis.prismaClient.reader.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: [],
                total: 0,
                pageSize: requestBody.pageSize,
                page: requestBody.pageNumber,
                pages: calcPages(requestBody.pageSize, 0),
              });
              done();
            });
        });
    });

    test('client pagination failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.USER_UNAUTHORIZED,
                errorCode: ErrorCode.HAVE_NOT_LOGIN,
              });
              done();
            });
        });
    });

    test('client pagination failed session expired', (done) => {
      expect.hasAssertions();
      destroySession()
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', apiKey)
            .expect(HTTP_CODE.UNAUTHORIZED)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: USER.WORKING_SESSION_EXPIRE,
                errorCode: ErrorCode.WORKING_SESSION_ENDED,
              });
              done();
            });
        });
    });

    test('client pagination failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', apiKey)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send({})
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(READER.PAGINATION_LOAD_CLIENT_FAIL),
                errors: [COMMON.REQUEST_DATA_EMPTY]
              });
              done();
            });
        });
    });

    test('client pagination failed with undefine request body field', (done) => {
      const undefineField = 'clientIds';
      const newRequestBody = {
        ...requestBody,
        [undefineField]: [Date.now().toString()],
      };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', apiKey)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send(newRequestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(READER.PAGINATION_LOAD_CLIENT_FAIL),
                errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
              });
              done();
            });
        });
    });

    test('client pagination failed with bad request', (done) => {
      const badRequestBody = {
        pageSize: requestBody.pageSize,
        pageNumber: requestBody.pageNumber,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', apiKey)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send(badRequestBody)
            .then((response) => {
              expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.findMany).not.toHaveBeenCalled();
              expect(globalThis.prismaClient.reader.count).not.toHaveBeenCalled();
              expect(response.body).toEqual({
                message: getInputValidateMessage(READER.PAGINATION_LOAD_CLIENT_FAIL),
                errors: expect.any(Array),
              });
              expect(response.body.errors).toHaveLength(1);
              done();
            });
        });
    });

    test('client pagination failed with output validate error', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        ClientDummyData.createMockClientList(clientLength),
        clientLength,
      ]);

      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', apiKey)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({
                select: selectExpected,
                orderBy: {
                  reader_id: 'desc'
                },
                take: requestBody.pageSize,
                skip: offset
              });
              expect(globalThis.prismaClient.reader.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                message: COMMON.OUTPUT_VALIDATE_FAIL,
              });
              done();
            });
        });
    });

    test('client pagination failed with server error', (done) => {
      globalThis.prismaClient.$transaction.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData, 'client')
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', apiKey)
            .expect(HTTP_CODE.SERVER_ERROR)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const selectExpected = parseToPrismaSelect.mock.results[0].value;
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.reader.findMany).toHaveBeenCalledWith({
                select: selectExpected,
                orderBy: {
                  reader_id: 'desc'
                },
                take: requestBody.pageSize,
                skip: offset
              });
              expect(globalThis.prismaClient.reader.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                message: COMMON.INTERNAL_ERROR_MESSAGE,
              });
              done();
            });
        });
    });
  });
});
