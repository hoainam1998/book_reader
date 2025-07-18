const { ServerError } = require('#test/mocks/other-errors');
const { PrismaNotFoundError } = require('#test/mocks/prisma-error');
const OutputValidate = require('#services/output-validate');
const UserDummyData = require('#test/resources/dummy-data/user');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const userDetailUrl = UserRoutePath.userDetail.abs;
const mockUser = UserDummyData.MockData;

const requestBody = {
  userId: mockUser.user_id,
  query: {
    firstName: true,
    lastName: true,
    email: true,
    avatar: true,
    mfaEnable: true,
    phone: true,
    power: true,
    sex: true,
  },
};

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

describe('user detail', () => {
  commonTest(
    'user detail api common test',
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
        url: userDetailUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'user detail api cors',
        url: userDetailUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'user detail common test'
  );

  describe(createDescribeTest(METHOD.POST, userDetailUrl), () => {
    test('get user detail will be success admin - user', (done) => {
      const userDetailExpected = UserDummyData.generateExpectedObject(requestBody.query);
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: requestBody.userId,
              },
              select: selectExpected,
            });
            expect(response.body).toEqual(userDetailExpected);
            done();
          });
      });
    });

    test('get user detail success with super admin - user', (done) => {
      expect.hasAssertions();
      const userDetailExpected = UserDummyData.generateExpectedObject(requestBody.query);
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionDataWithSuperAdminRole).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: requestBody.userId,
              },
              select: selectExpected,
            });
            expect(response.body).toEqual(userDetailExpected);
            done();
          });
      });
    });

    test('get user detail success with super admin - admin', (done) => {
      const userDetailExpected = UserDummyData.generateExpectedObject(requestBody.query);
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionDataWithSuperAdminRole).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: requestBody.userId,
              },
              select: selectExpected,
            });
            expect(response.body).toEqual(userDetailExpected);
            done();
          });
      });
    });

    test('get user detail failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('get user detail failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('get user detail failed with user have user role', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionDataWithUserRole).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.NOT_PERMISSION)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.NOT_PERMISSION,
            });
            done();
          });
      });
    });

    test('get user detail failed with admin - admin', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.NOT_PERMISSION)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: requestBody.userId,
              },
              select: selectExpected,
            });
            expect(response.body).toEqual({
              message: USER.NOT_PERMISSION,
            });
            done();
          });
      });
    });

    test('get user detail failed with request body empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send({})
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.LOAD_USER_DETAIL_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('get user detail failed with request body missing field', (done) => {
      // missing userId
      const badRequestBody = {
        query: requestBody.query,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.LOAD_USER_DETAIL_FAIL),
              errors: expect.arrayContaining([expect.any(String)]),
            });
            done();
          });
      });
    });

    test('get user detail failed with undefine request body field', (done) => {
      const undefineField = 'userIds';
      const badRequestBody = {
        [undefineField]: [Date.now().toString()],
        ...requestBody,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(badRequestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            expect(globalThis.prismaClient.user.findUniqueOrThrow).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.LOAD_USER_DETAIL_FAIL),
              errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
            });
            done();
          });
      });
    });

    test('get user detail failed with output validate error', (done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockResolvedValue(mockUserWithUserRole);
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: requestBody.userId,
              },
              select: selectExpected,
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
    ])('get user detail failed with $describe', ({ cause, expected, status }, done) => {
      globalThis.prismaClient.user.findUniqueOrThrow.mockRejectedValue(cause);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(userDetailUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(status)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
              where: {
                user_id: requestBody.userId,
              },
              select: selectExpected,
            });
            expect(response.body).toEqual(expected);
            done();
          });
      });
    });
  });
});
