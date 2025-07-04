const jwt = require('jsonwebtoken');
const { ServerError } = require('#test/mocks/other-errors');
const { PrismaDuplicateError } = require('#test/mocks/prisma-error');
const ClientDummyData = require('#test/resources/dummy-data/client');
const OutputValidate = require('#services/output-validate');
const ClientRoutePath = require('#services/route-paths/client');
const { HTTP_CODE, METHOD, PATH } = require('#constants');
const { READER, COMMON } = require('#messages');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const { signClientResetPasswordToken } = require('#utils');
const clientSignupUrl = ClientRoutePath.signUp.abs;
const mockRequestClient = ClientDummyData.MockRequestData;

const requestBody = {
  firstName: mockRequestClient.first_name,
  lastName: mockRequestClient.last_name,
  email: mockRequestClient.email,
  password: ClientDummyData.password,
  sex: mockRequestClient.sex.toString(),
};

describe('client signup', () => {
  commonTest('client signup api common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.CLIENT}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: clientSignupUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'client signup api cors',
      url: clientSignupUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.CLIENT_ORIGIN_CORS,
    }
  ], 'client signup common test');

  describe(createDescribeTest(METHOD.POST, clientSignupUrl), () => {
    test('client signup will be success', (done) => {
      const mockResetPasswordToken = signClientResetPasswordToken(mockRequestClient.email);
      const signResult = jest.spyOn(jwt, 'sign').mockImplementation(() => mockResetPasswordToken);
      globalThis.prismaClient.reader.create.mockResolvedValue(mockRequestClient);

      expect.hasAssertions();
      globalThis.api
        .post(clientSignupUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledWith({
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              password: requestBody.password,
              sex: +requestBody.sex,
              reset_password_token: signResult.mock.results[0].value,
            },
          });
          expect(response.body).toEqual({
            message: READER.SIGNUP_SUCCESS,
          });
          done();
        });
    });

    test('client signup failed request body are empty', (done) => {
      expect.hasAssertions();
      globalThis.api
        .post(clientSignupUrl)
        .set('Connection', 'keep-alive')
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(READER.SIGNUP_FAIL),
            errors: [COMMON.REQUEST_DATA_EMPTY],
        });
        done();
      });
    });

    test('client signup failed request body is missing field', (done) => {
      // missing email
      const badRequestBody = { ...requestBody };
      delete badRequestBody.email;

      expect.hasAssertions();
      globalThis.api
        .post(clientSignupUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(READER.SIGNUP_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(1);
          done();
      });
    });

    test('client signup failed with undefine request body field', (done) => {
      // query is undefine field
      const undefineField = 'query';
      const badRequestBody = {
        ...requestBody,
        [undefineField]: {
          message: true,
        }
      };

      expect.hasAssertions();
      globalThis.api
        .post(clientSignupUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(READER.SIGNUP_FAIL),
            errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
          });
        done();
      });
    });

    test('client signup failed with email already exist', (done) => {
      const mockResetPasswordToken = signClientResetPasswordToken(mockRequestClient.email);
      const signResult = jest.spyOn(jwt, 'sign').mockImplementation(() => mockResetPasswordToken);
      globalThis.prismaClient.reader.create.mockRejectedValue(PrismaDuplicateError);

      expect.hasAssertions();
      globalThis.api
        .post(clientSignupUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledWith({
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              password: requestBody.password,
              sex: +requestBody.sex,
              reset_password_token: signResult.mock.results[0].value,
            },
          });
          expect(response.body).toEqual({
            message: READER.EMAIL_EXIST,
          });
        done();
      });
    });

    test('client signup failed with output validate error', (done) => {
      globalThis.prismaClient.reader.create.mockReset();
      const mockResetPasswordToken = signClientResetPasswordToken(mockRequestClient.email);
      const signResult = jest.spyOn(jwt, 'sign').mockImplementation(() => mockResetPasswordToken);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      globalThis.api
        .post(clientSignupUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledWith({
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              password: requestBody.password,
              sex: +requestBody.sex,
              reset_password_token: signResult.mock.results[0].value,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
        done();
      });
    });

    test('client signup failed with server error', (done) => {
      const mockResetPasswordToken = signClientResetPasswordToken(mockRequestClient.email);
      const signResult = jest.spyOn(jwt, 'sign').mockImplementation(() => mockResetPasswordToken);
      globalThis.prismaClient.reader.create.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .post(clientSignupUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .then((response) => {
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.reader.create).toHaveBeenCalledWith({
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              password: requestBody.password,
              sex: +requestBody.sex,
              reset_password_token: signResult.mock.results[0].value,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
        done();
      });
    });
  })
});
