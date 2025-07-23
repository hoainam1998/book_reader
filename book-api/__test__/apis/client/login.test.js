const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const ClientDummyData = require('#test/resources/dummy-data/client');
const PrismaField = require('#services/prisma-fields/prisma-field');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const ClientRoutePath = require('#services/route-paths/client');
const { HTTP_CODE, METHOD, PATH, BLOCK } = require('#constants');
const { USER, READER, COMMON } = require('#messages');
const commonTest = require('#test/apis/common/common');
const { signedTestCookie } = require('#test/resources/auth');
const { signClientResetPasswordToken, autoGeneratePassword } = require('#utils');
const { createDescribeTest, getInputValidateMessage } = require('#test/helpers/index');
const loginUrl = ClientRoutePath.login.abs;
const clientRequestMock = ClientDummyData.MockRequestData;
const clientMock = ClientDummyData.MockData;

const requestBody = {
  email: clientRequestMock.email,
  password: ClientDummyData.password,
  query: {
    clientId: true,
    firstName: true,
    lastName: true,
    passwordMustChange: true,
    apiKey: true,
    avatar: true,
    email: true,
  },
};

const mockClientWithBlocked = {
  ...clientMock,
  blocked: BLOCK.ON,
};

describe('client login', () => {
  commonTest(
    'login api common test',
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
        url: loginUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'login api cors',
        url: loginUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.CLIENT_ORIGIN_CORS,
      },
    ],
    'login common test'
  );

  describe(createDescribeTest(METHOD.POST, loginUrl), () => {
    test('login will be success', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const clientExpected = ClientDummyData.generateExpectedObject(requestBody.query);

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(requestBody);
      const selectExpected = parseToPrismaSelect.mock.results[0].value;
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.OK);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: requestBody.email,
            },
            {
              reader_id: requestBody.email,
            },
          ],
        },
        select: { ...selectExpected, password: true, blocked: true },
      });
      expect(response.body).toEqual(clientExpected);
    });

    test('login success in after user was reset password', async () => {
      ClientDummyData.ExpectedTypes = Object.assign(ClientDummyData.ExpectedTypes, { apiKey: null });
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        reset_password_token: signClientResetPasswordToken(clientMock.email),
        password: await clientMock.password,
      });
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const clientExpected = ClientDummyData.generateExpectedObject(requestBody.query);

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(requestBody);
      const selectExpected = parseToPrismaSelect.mock.results[0].value;
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.OK);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: requestBody.email,
            },
            {
              reader_id: requestBody.email,
            },
          ],
        },
        select: { ...selectExpected, password: true, blocked: true },
      });
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
        where: {
          reader_id: clientMock.reader_id,
        },
        data: {
          session_id: expect.any(String),
        },
      });
      expect(response.body).toEqual(clientExpected);
    });

    test('login failed with update session id error', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      globalThis.prismaClient.reader.update.mockRejectedValue(PrismaNotFoundError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(requestBody);
      const selectExpected = parseToPrismaSelect.mock.results[0].value;
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: requestBody.email,
            },
            {
              reader_id: requestBody.email,
            },
          ],
        },
        select: { ...selectExpected, password: true, blocked: true },
      });
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.update).toHaveBeenCalledWith({
        where: {
          reader_id: clientMock.reader_id,
        },
        data: {
          session_id: expect.any(String),
        },
      });
      expect(response.body).toEqual({
        message: USER.USER_NOT_FOUND,
      });
    });

    test('login failed due user is already login', async () => {
      expect.hasAssertions();
      const responseSign = await signedTestCookie(ClientDummyData.session.client, 'client');
      const response = await globalThis.api
        .post(loginUrl)
        .set('Cookie', [responseSign.header['set-cookie']])
        .send(requestBody);
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: USER.ONLY_ONE_DEVICE,
        errorCode: ErrorCode.ONLY_ALLOW_ONE_DEVICE,
      });
    });

    test('login failed due password not match', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      const requestBodyWithNewPassword = {
        ...requestBody,
        password: autoGeneratePassword(),
      };
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(requestBodyWithNewPassword);
      const selectExpected = parseToPrismaSelect.mock.results[0].value;
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.UNAUTHORIZED);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: requestBody.email,
            },
            {
              reader_id: requestBody.email,
            },
          ],
        },
        select: { ...selectExpected, password: true, blocked: true },
      });
      expect(response.body).toEqual({
        message: READER.USER_NOT_FOUND,
      });
    });

    test('login failed with user was block', async () => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...mockClientWithBlocked,
        password: await clientMock.password,
      });
      const requestBodyWithNewPassword = {
        ...requestBody,
        password: autoGeneratePassword(),
      };
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(requestBodyWithNewPassword);
      const selectExpected = parseToPrismaSelect.mock.results[0].value;
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.NOT_PERMISSION);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: requestBody.email,
            },
            {
              reader_id: requestBody.email,
            },
          ],
        },
        select: { ...selectExpected, password: true, blocked: true },
      });
      expect(response.body).toEqual({
        message: READER.YOU_ARE_BLOCK,
      });
    });

    test('login failed with request body is empty', async () => {
      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl);
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: getInputValidateMessage(USER.LOGIN_FAIL),
        errors: [COMMON.REQUEST_DATA_EMPTY],
      });
    });

    test('login failed with request body are missing field', async () => {
      // missing query field
      const badRequestBody = { ...requestBody };
      delete badRequestBody.query;

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(badRequestBody);
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: getInputValidateMessage(USER.LOGIN_FAIL),
        errors: expect.any(Array),
      });
      expect(response.body.errors.length).toBeGreaterThanOrEqual(1);
    });

    test('login failed with undefine request body field', async () => {
      // readerId is undefine field
      const undefineField = 'readerId';
      const badRequestBody = { ...requestBody, [undefineField]: Date.now().toString() };

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(badRequestBody);
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        message: getInputValidateMessage(USER.LOGIN_FAIL),
        errors: expect.arrayContaining([expect.stringMatching(COMMON.FIELD_NOT_EXPECT.format(undefineField))]),
      });
    });

    test.each([
      {
        describe: 'user not found',
        cause: PrismaNotFoundError,
        expected: {
          message: READER.USER_NOT_FOUND,
        },
        status: HTTP_CODE.UNAUTHORIZED,
      },
      {
        describe: 'server error',
        cause: ServerError,
        expected: {
          message: COMMON.INTERNAL_ERROR_MESSAGE,
        },
        status: HTTP_CODE.SERVER_ERROR,
      },
    ])('login failed with $describe', async ({ cause, expected, status }) => {
      globalThis.prismaClient.reader.findFirstOrThrow.mockRejectedValue(cause);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(requestBody);
      const selectExpected = parseToPrismaSelect.mock.results[0].value;
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(status);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: requestBody.email,
            },
            {
              reader_id: requestBody.email,
            },
          ],
        },
        select: { ...selectExpected, password: true, blocked: true },
      });
      expect(response.body).toEqual(expected);
    });

    test('login failed with output validate error', async () => {
      globalThis.prismaClient.reader.update.mockResolvedValue(clientMock);
      globalThis.prismaClient.reader.findFirstOrThrow.mockResolvedValue({
        ...clientMock,
        password: await clientMock.password,
      });
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      const response = await globalThis.api.post(loginUrl).send(requestBody);
      const selectExpected = parseToPrismaSelect.mock.results[0].value;
      expect(response.header['content-type']).toMatch(/application\/json/);
      expect(response.status).toBe(HTTP_CODE.BAD_REQUEST);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(globalThis.prismaClient.reader.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              email: requestBody.email,
            },
            {
              reader_id: requestBody.email,
            },
          ],
        },
        select: { ...selectExpected, password: true, blocked: true },
      });
      expect(response.body).toEqual({
        message: COMMON.OUTPUT_VALIDATE_FAIL,
      });
    });
  });
});
