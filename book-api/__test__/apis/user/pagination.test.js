const { ServerError } = require('#test/mocks/other-errors');
const GraphqlResponse = require('#dto/common/graphql-response');
const ErrorCode = require('#services/error-code');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const { createMockUserList } = require('#test/resources/test-data');
const paginationUrl = `${PATH.USER}/pagination`;

const queryFieldExpectedTypes = {
  userId: expect.any(String),
  name: expect.any(String),
  email: expect.any(String),
  avatar: expect.any(String),
  phone: expect.any(String),
  sex: expect.any(Number),
  role: expect.any(String),
  isAdmin: expect.any(Boolean),
  mfaEnable: expect.any(Boolean),
};

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

const userLength = 2;

const generateUserExpectedList = (requestBodyQuery, excludeFields= []) => {
  return Array.apply(null, Array(userLength)).map(() => {
    return Object.keys(requestBodyQuery).reduce((queryExpected, field) => {
      if (excludeFields.length) {
        if (excludeFields.includes(field)) {
          return queryExpected;
        }
      }
      queryExpected[field] = queryFieldExpectedTypes[field];
      return queryExpected;
    }, {});
  });
};

describe('user pagination', () => {
  commonTest('user pagination api common test', [
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
    }
  ], 'user pagination common test');

  describe(createDescribeTest(METHOD.POST, paginationUrl), () => {
    test('user pagination success', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        createMockUserList(userLength),
        userLength,
      ]);

      const userListExpected = generateUserExpectedList(requestBody.query);

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: expect.objectContaining({
                    power: true,
                  }),
                  orderBy: {
                    user_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: expect.any(Array),
                total: userLength,
              });
              expect(response.body.list).toEqual(userListExpected);
              done();
            });
        });
    });

    test('user pagination success with user role', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        createMockUserList(userLength),
        userLength,
      ]);

      const userListExpected = generateUserExpectedList(requestBody.query, ['userId', 'mfaEnable', 'isAdmin']);

      signedTestCookie({ ...sessionData.user, role: POWER.USER })
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: expect.objectContaining({
                    power: true,
                  }),
                  orderBy: {
                    user_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: expect.any(Array),
                total: userLength,
              });
              expect(response.body.list).toEqual(userListExpected);
              done();
            });
        });
    });

    test('user pagination success with search key', (done) => {
      const requestBodyWithKeyValue = {
        ...requestBody,
        keyword: 'user name'
      };

      globalThis.prismaClient.$transaction.mockResolvedValue([
        createMockUserList(userLength),
        userLength,
      ]);

      const userListExpected = generateUserExpectedList(requestBodyWithKeyValue.query);

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.OK)
            .expect('Content-Type', /application\/json/)
            .send(requestBodyWithKeyValue)
            .then((response) => {
              console.log(response.body);
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: expect.objectContaining({
                    power: true,
                  }),
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
                    user_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.count).toHaveBeenCalledWith(
                expect.objectContaining({
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
                })
              );
              expect(response.body).toEqual({
                list: expect.any(Array),
                total: userLength,
              });
              expect(response.body.list).toEqual(userListExpected);
              done();
            });
        });
    });

    test('user pagination failed users are empty', (done) => {
      globalThis.prismaClient.$transaction.mockResolvedValue([
        [],
        0,
      ]);

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('authorization', authenticationToken)
            .set('Cookie', [responseSign.header['set-cookie']])
            .expect(HTTP_CODE.NOT_FOUND)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: expect.objectContaining({
                    power: true,
                  }),
                  orderBy: {
                    user_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
              expect(globalThis.prismaClient.user.count).toHaveBeenCalledTimes(1);
              expect(response.body).toEqual({
                list: [],
                total: 0,
              });
              done();
            });
        });
    });

    test('user pagination failed authentication token unset', (done) => {
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
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
      destroySession()
        .then((responseSign) => {
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
      signedTestCookie(sessionData.user)
        .then((responseSign) => {
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
                errors: [COMMON.REQUEST_DATA_EMPTY]
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

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
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
        createMockUserList(userLength),
        userLength,
      ]);

      jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
        () => GraphqlResponse.dto.parse({
          data: {
            list: [],
            total: 0,
          }
        })
      );

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.BAD_REQUEST)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: expect.objectContaining({
                    power: true,
                  }),
                  orderBy: {
                    user_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
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

      signedTestCookie(sessionData.user)
        .then((responseSign) => {
          globalThis.api
            .post(paginationUrl)
            .set('Cookie', [responseSign.header['set-cookie']])
            .set('authorization', authenticationToken)
            .expect(HTTP_CODE.SERVER_ERROR)
            .expect('Content-Type', /application\/json/)
            .send(requestBody)
            .then((response) => {
              const offset = (requestBody.pageNumber - 1) * requestBody.pageSize;
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.$transaction).toHaveBeenCalledWith(expect.any(Array));
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledTimes(1);
              expect(globalThis.prismaClient.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                  select: expect.objectContaining({
                    power: true,
                  }),
                  orderBy: {
                    user_id: 'desc'
                  },
                  take: requestBody.pageSize,
                  skip: offset
                })
              );
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
