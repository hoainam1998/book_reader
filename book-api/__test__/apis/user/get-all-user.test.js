const { ServerError } = require('#test/mocks/other-errors');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const UserDummyData = require('#test/resources/dummy-data/user');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const {
  authenticationToken,
  sessionData,
  mockUser,
  signedTestCookie,
  destroySession,
} = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const allUserUrl = UserRoutePath.all.abs;

const requestBody = {
  query: {
    userId: true,
    avatar: true,
    sex: true,
    mfaEnable: true,
    phone: true,
    name: true,
    role: true,
    isAdmin: true,
  },
};

const sessionDataWithSuperAdminRole = {
  ...sessionData.user,
  role: POWER.SUPER_ADMIN,
};

const userLength = 2;

describe('get all user', () => {
  commonTest(
    'get all user api common test',
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
        url: allUserUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'get all user api cors',
        url: allUserUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'get all user common test'
  );

  describe(createDescribeTest(METHOD.POST, allUserUrl), () => {
    test.each([
      {
        describe: 'admin role',
        sessionData: sessionData.user,
        excludeFields: ['userId', 'mfaEnable'],
      },
      {
        describe: 'super admin role',
        sessionData: sessionDataWithSuperAdminRole,
        excludeFields: [],
      },
    ])('get all user success with $describe', ({ sessionData, excludeFields }, done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const userExpected = UserDummyData.generateExpectedObject(requestBody.query, excludeFields);
      globalThis.prismaClient.user.findMany.mockResolvedValue(UserDummyData.createMockUserList(userLength));

      expect.hasAssertions();
      signedTestCookie(sessionData).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .send(requestBody)
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                select: {
                  ...selectExpected,
                  power: true,
                },
              })
            );
            expect(response.body).toEqual(expect.toBeMatchList(sessionData.userId, sessionData.role, userExpected));
            expect(response.body).toHaveLength(userLength);
            done();
          });
      });
    });

    test('get all user success with exclude id', (done) => {
      const requestBodyWithExcludeId = {
        ...requestBody,
        exclude: mockUser.user_id,
      };

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const userExpected = UserDummyData.generateExpectedObject(requestBody.query, ['userId', 'mfaEnable']);
      globalThis.prismaClient.user.findMany.mockResolvedValue(UserDummyData.createMockUserList(userLength));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBodyWithExcludeId)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                select: {
                  ...selectExpected,
                  power: true,
                },
                where: {
                  user_id: {
                    not: requestBodyWithExcludeId.exclude,
                  },
                },
              })
            );
            expect(response.body).toEqual(
              expect.toBeMatchList(sessionData.user.userId, sessionData.user.role, userExpected)
            );
            expect(response.body).toHaveLength(userLength);
            done();
          });
      });
    });

    test('get all user success with user has user role', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const userExpectedList = UserDummyData.generateUserExpectedList(requestBody.query, userLength, [
        'userId',
        'mfaEnable',
        'isAdmin',
      ]);
      globalThis.prismaClient.user.findMany.mockResolvedValue(UserDummyData.createMockUserList(userLength));

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, role: POWER.USER }).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                select: {
                  ...selectExpected,
                  power: true,
                },
              })
            );
            expect(response.body).toEqual(userExpectedList);
            expect(response.body).toHaveLength(userLength);
            done();
          });
      });
    });

    test('get all user failed with authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('get all user failed with session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('get all user failed with users not found', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.user.findMany.mockResolvedValue([]);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                select: {
                  ...selectExpected,
                  power: true,
                },
              })
            );
            expect(response.body).toEqual([]);
            expect(response.body).toHaveLength(0);
            done();
          });
      });
    });

    test('get all user failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send({})
          .then((response) => {
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.LOAD_ALL_USER_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('get all user failed with undefine request body field', (done) => {
      const undefineField = 'userIds';
      const badRequestBody = {
        [undefineField]: [mockUser.user_id],
        query: requestBody.query,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(badRequestBody)
          .then((response) => {
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.LOAD_ALL_USER_FAIL),
              errors: [COMMON.FIELD_NOT_EXPECT.format(undefineField)],
            });
            done();
          });
      });
    });

    test('get all user failed with output validate error', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.user.findMany.mockResolvedValue(UserDummyData.createMockUserList(userLength));
      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                select: {
                  ...selectExpected,
                  power: true,
                },
              })
            );
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('get all user failed with server error', (done) => {
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      globalThis.prismaClient.user.findMany.mockRejectedValue(ServerError);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(allUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', responseSign.header['set-cookie'])
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                select: {
                  ...selectExpected,
                  power: true,
                },
              })
            );
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
