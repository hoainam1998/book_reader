const { ServerError } = require('#test/mocks/other-errors');
const ErrorCode = require('#services/error-code');
const GraphqlResponse = require('#dto/common/graphql-response');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, sessionData, signedTestCookie } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const signUpUrl = UserRoutePath.signup.abs;

const requestBody = {
  firstName: mockUser.first_name,
  lastName: mockUser.last_name,
  email: mockUser.email,
  sex: mockUser.sex,
  phone: mockUser.phone,
};

describe('signup admin', () => {
  commonTest(
    'signup user internal api common test',
    [
      {
        name: 'cors test',
        describe: 'signup internal api cors',
        url: signUpUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'signup user internal'
  );

  describe(createDescribeTest(METHOD.POST, signUpUrl), () => {
    test('signup admin user will be success', (done) => {
      globalThis.prismaClient.user.count.mockResolvedValue(0);

      expect.hasAssertions();
      globalThis.api
        .post(signUpUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.CREATED)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledWith({
            isSignup: true,
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              sex: requestBody.sex,
              phone: requestBody.phone,
            },
          });
          expect(response.body).toEqual({
            message: USER.SIGNUP_SUCCESS,
          });
          done();
        });
    });

    test('signup admin user failed when has admin user', (done) => {
      globalThis.prismaClient.user.count.mockResolvedValue(1);

      expect.hasAssertions();
      globalThis.api
        .post(signUpUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.UNAUTHORIZED)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: USER.ALREADY_HAS_ADMIN_USER,
            errorCode: ErrorCode.ALREADY_HAVE_ADMIN,
          });
          done();
        });
    });

    test('signup admin user failed with bad request', (done) => {
      // missing email field.
      // avatar, image are unexpected fields.
      const badRequestBody = { ...requestBody, avatar: 'avatar', image: 'image' };
      delete badRequestBody.email;

      expect.hasAssertions();
      globalThis.api
        .post(signUpUrl)
        .send(badRequestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).not.toHaveBeenCalled();
          expect(globalThis.prismaClient.user.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: getInputValidateMessage(USER.SIGNUP_FAIL),
            errors: expect.any(Array),
          });
          expect(response.body.errors).toHaveLength(3);
          done();
        });
    });

    test('signup admin user failed with output validate error', (done) => {
      globalThis.prismaClient.user.count.mockResolvedValue(0);
      globalThis.prismaClient.user.create.mockResolvedValue();
      jest.spyOn(GraphqlResponse, 'parse').mockReturnValue({
        success: false,
        message: COMMON.OUTPUT_VALIDATE_FAIL,
      });

      expect.hasAssertions();
      globalThis.api
        .post(signUpUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.BAD_REQUEST)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledWith({
            isSignup: true,
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              sex: requestBody.sex,
              phone: requestBody.phone,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.OUTPUT_VALIDATE_FAIL,
          });
          done();
        });
    });

    test('signup admin user failed with invalid gender', (done) => {
      const requestBodyInvalidGender = {
        ...requestBody,
        sex: 2,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(signUpUrl)
          .send(requestBodyInvalidGender)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.user.count).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.create).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.SIGNUP_FAIL),
              errors: expect.arrayContaining([expect.any(String)]),
            });
            done();
          });
      });
    });

    test('signup admin user failed with create method got server error', (done) => {
      globalThis.prismaClient.user.create.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .post(signUpUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).toHaveBeenCalledWith({
            isSignup: true,
            data: {
              first_name: requestBody.firstName,
              last_name: requestBody.lastName,
              email: requestBody.email,
              sex: requestBody.sex,
              phone: requestBody.phone,
            },
          });
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });

    test('signup admin user failed with count method got server error', (done) => {
      globalThis.prismaClient.user.count.mockRejectedValue(ServerError);

      expect.hasAssertions();
      globalThis.api
        .post(signUpUrl)
        .send(requestBody)
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.SERVER_ERROR)
        .then((response) => {
          expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
          expect(globalThis.prismaClient.user.create).not.toHaveBeenCalled();
          expect(response.body).toEqual({
            message: COMMON.INTERNAL_ERROR_MESSAGE,
          });
          done();
        });
    });
  });
});
