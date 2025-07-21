const { ServerError } = require('#test/mocks/other-errors');
const UserDummyData = require('#test/resources/dummy-data/user');
const OutputValidate = require('#services/output-validate');
const ErrorCode = require('#services/error-code');
const PrismaField = require('#services/prisma-fields/prisma-field');
const UserRoutePath = require('#services/route-paths/user');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { calcPages } = require('#utils');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const paginationUrl = UserRoutePath.pagination.abs;

const requestBody = {
  pageSize: 10,
  pageNumber: 1,
  query: {
    userId: true,
    name: true,
    avatar: true,
    email: true,
    phone: true,
    sex: true,
    role: true,
    isAdmin: true,
    mfaEnable: true,
  },
};

const sessionDataWithSuperAdminRole = {
  ...sessionData.user,
  role: POWER.SUPER_ADMIN,
};

const userLength = 2;

describe('user pagination', () => {
  commonTest(
    'user pagination api common test',
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
        url: paginationUrl,
        method: METHOD.GET.toLowerCase(),
      },
      {
        name: 'cors test',
        describe: 'user pagination api cors',
        url: paginationUrl,
        method: METHOD.POST.toLowerCase(),
        origin: process.env.ORIGIN_CORS,
      },
    ],
    'user pagination common test'
  );

  describe(createDescribeTest(METHOD.POST, paginationUrl), () => {
    test.each([
      {
        describe: 'admin role',
        sessionData: sessionData.user,
      },
      {
        describe: 'super admin role',
        sessionData: sessionDataWithSuperAdminRole,
      }
    ])('user pagination success with $describe', ({ sessionData }, done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        UserDummyData.createMockUserList(userLength),
        userLength,
      ]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const userExpected = UserDummyData.generateExpectedObject(requestBody.query, ['userId', 'mfaEnable']);

      expect.hasAssertions();
      signedTestCookie(sessionData).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith({
              select: {
                ...selectExpected,
                power: true,
              },
              orderBy: {
                user_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              list: expect.toBeMatchList(sessionData.userId, sessionData.role, userExpected),
              total: userLength,
              page: requestBody.pageNumber,
              pages: calcPages(requestBody.pageSize, userLength),
              pageSize: requestBody.pageSize,
            });
            done();
          });
      });
    });

    test('user pagination success with user role', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        UserDummyData.createMockUserList(userLength),
        userLength,
      ]);

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const userListExpected = UserDummyData.generateUserExpectedList(requestBody.query, userLength, [
        'userId',
        'mfaEnable',
        'isAdmin',
      ]);

      expect.hasAssertions();
      signedTestCookie({ ...sessionData.user, role: POWER.USER }).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith({
              select: {
                ...selectExpected,
                power: true,
              },
              orderBy: {
                user_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              list: userListExpected,
              total: userLength,
              page: requestBody.pageNumber,
              pages: calcPages(requestBody.pageSize, userLength),
              pageSize: requestBody.pageSize,
            });
            done();
          });
      });
    });

    test('user pagination success with search key', (done) => {
      const requestBodyWithKeyValue = {
        ...requestBody,
        keyword: 'user name',
      };

      globalThis.prismaClient.$transaction.mockResolvedValue([
        UserDummyData.createMockUserList(userLength),
        userLength,
      ]);

      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');
      const userExpected = UserDummyData.generateExpectedObject(requestBody.query, ['userId', 'mfaEnable']);

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.OK)
          .expect('Content-Type', /application\/json/)
          .send(requestBodyWithKeyValue)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith({
              select: {
                ...selectExpected,
                power: true,
              },
              where: {
                OR: [
                  {
                    last_name: {
                      contains: requestBodyWithKeyValue.keyword,
                    },
                  },
                  {
                    first_name: {
                      contains: requestBodyWithKeyValue.keyword,
                    },
                  },
                ],
              },
              orderBy: {
                user_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.count).toHaveBeenCalledWith({
              where: {
                OR: [
                  {
                    last_name: {
                      contains: requestBodyWithKeyValue.keyword,
                    },
                  },
                  {
                    first_name: {
                      contains: requestBodyWithKeyValue.keyword,
                    },
                  },
                ],
              },
            });
            expect(response.body).toEqual({
              list: expect.toBeMatchList(sessionData.user.userId, sessionData.user.role, userExpected),
              total: userLength,
              page: requestBody.pageNumber,
              pages: calcPages(requestBody.pageSize, userLength),
              pageSize: requestBody.pageSize,
            });
            done();
          });
      });
    });

    test('user pagination failed users are empty', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([[], 0]);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.NOT_FOUND)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith({
              select: {
                ...selectExpected,
                power: true,
              },
              orderBy: {
                user_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              list: [],
              total: 0,
              page: requestBody.pageNumber,
              pages: calcPages(requestBody.pageSize, 0),
              pageSize: requestBody.pageSize,
            });
            done();
          });
      });
    });

    test('user pagination failed authentication token unset', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
    });

    test('user pagination failed session expired', (done) => {
      expect.hasAssertions();
      destroySession().then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
    });

    test('user pagination failed with request body are empty', (done) => {
      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send({})
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.PAGINATION_LOAD_USER_FAIL),
              errors: [COMMON.REQUEST_DATA_EMPTY],
            });
            done();
          });
      });
    });

    test('user pagination failed with bad request', (done) => {
      const badRequestBody = {
        pageSize: requestBody.pageSize,
        pageNumber: requestBody.pageNumber,
      };

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(badRequestBody)
          .then((response) => {
            expect(globalThis.prismaClient.$transaction).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.findMany).not.toHaveBeenCalled();
            expect(globalThis.prismaClient.user.count).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: getInputValidateMessage(USER.PAGINATION_LOAD_USER_FAIL),
              errors: expect.any(Array),
            });
            expect(response.body.errors).toHaveLength(1);
            done();
          });
      });
    });

    test('user pagination failed with output validate error', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        UserDummyData.createMockUserList(userLength),
        userLength,
      ]);

      jest.spyOn(OutputValidate, 'prepare').mockImplementation(() => OutputValidate.parse({}));
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.BAD_REQUEST)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith({
              select: {
                ...selectExpected,
                power: true,
              },
              orderBy: {
                user_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
    });

    test('user pagination failed with server error', (done) => {
      globalThis.prismaClient.$transaction.mockRejectedValue(ServerError);
      const parseToPrismaSelect = jest.spyOn(PrismaField.prototype, 'parseToPrismaSelect');

      expect.hasAssertions();
      signedTestCookie(sessionData.user).then((responseSign) => {
        globalThis.api
          .post(paginationUrl)
          .set('Cookie', [responseSign.header['set-cookie']])
          .set('authorization', authenticationToken)
          .expect(HTTP_CODE.SERVER_ERROR)
          .expect('Content-Type', /application\/json/)
          .send(requestBody)
          .then((response) => {
            const selectExpected = parseToPrismaSelect.mock.results[0].value;
            const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith({
              select: {
                ...selectExpected,
                power: true,
              },
              orderBy: {
                user_id: 'desc',
              },
              take: requestBody.pageSize,
              skip: offset,
            });
            expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual({
              message: COMMON.INTERNAL_ERROR_MESSAGE,
            });
            done();
          });
      });
    });
  });
});
