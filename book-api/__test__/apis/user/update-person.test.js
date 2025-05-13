const { PrismaNotFoundError, PrismaDuplicateError } = require('#test/mocks/prisma-error');
const { ServerError } = require('#test/mocks/other-errors');
const GraphqlResponse = require('#dto/common/graphql-response');
const ErrorCode = require('#services/error-code');
const { HTTP_CODE, PATH, METHOD } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, authenticationToken, sessionData, signedTestCookie, destroySession } = require('#test/resources/auth');
const { getInputValidateMessage, getStaticFile, createDescribeTest } = require('#test/helpers/index');
const commonTest = require('#test/apis/common/common');
const updatePersonUrl = `${PATH.USER}/update-person`;
let sessionToken;

describe(createDescribeTest(METHOD.POST, updatePersonUrl), () => {
  commonTest('update person common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: updatePersonUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'update person api cors',
      url: updatePersonUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'update person common test');

  test('update person will be success', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user)
      .then((responseApiSignin) => {
        sessionToken = responseApiSignin.header['set-cookie'];
        globalThis.prismaClient.user.update.mockResolvedValue();
        globalThis.api
          .put(updatePersonUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [sessionToken])
          .field('firstName', mockUser.first_name)
          .field('lastName', mockUser.last_name)
          .field('email', mockUser.email)
          .field('sex', mockUser.sex)
          .field('phone', mockUser.phone)
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.CREATED)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
            expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  user_id: mockUser.user_id
                }),
                data: expect.objectContaining({
                  first_name: mockUser.first_name,
                  last_name: mockUser.last_name,
                  email: mockUser.email,
                  sex: mockUser.sex,
                  phone: mockUser.phone,
                  avatar: expect.any(String),
                })
              })
            );
            expect(response.body).toEqual({
              message: USER.UPDATE_SELF_INFORMATION_SUCCESS
            });
            done();
          });
      });
  });

  test('update person failed with authentication token unset', (done) => {
    expect.hasAssertions();
    signedTestCookie(sessionData.user)
      .then((responseApiSignin) => {
        globalThis.api
          .put(updatePersonUrl)
          .set('Cookie', [responseApiSignin.header['set-cookie']])
          .field('firstName', mockUser.first_name)
          .field('lastName', mockUser.last_name)
          .field('email', mockUser.email)
          .field('sex', mockUser.sex)
          .field('phone', mockUser.phone)
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.USER_UNAUTHORIZED,
              errorCode: ErrorCode.HAVE_NOT_LOGIN,
            });
            done();
          });
      });
  });

  test('update person failed with session expired', (done) => {
    expect.hasAssertions();
    destroySession()
      .then(() => {
        globalThis.api
          .put(updatePersonUrl)
          .set('authorization', authenticationToken)
          .set('Connection', 'keep-alive')
          .field('firstName', mockUser.first_name)
          .field('lastName', mockUser.last_name)
          .field('email', mockUser.email)
          .field('sex', mockUser.sex)
          .field('phone', mockUser.phone)
          .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.UNAUTHORIZED)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toEqual({
              message: USER.WORKING_SESSION_EXPIRE,
              errorCode: ErrorCode.WORKING_SESSION_ENDED,
            });
            done();
          });
      });
  });

  test('update person failed with bad request', (done) => {
    // missing email field
    expect.hasAssertions();
    globalThis.api
      .put(updatePersonUrl)
      .set('authorization', authenticationToken)
      .set('Cookie', [sessionToken])
      .field('firstName', mockUser.first_name)
      .field('lastName', mockUser.last_name)
      .field('sex', mockUser.sex)
      .field('phone', mockUser.phone)
      .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
      .expect('Content-Type', /application\/json/)
      .expect(HTTP_CODE.BAD_REQUEST)
      .then((response) => {
        expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
        expect(response.body).toEqual({
          message: getInputValidateMessage(USER.UPDATE_USER_FAIL),
          errors: expect.arrayContaining([expect.any(String)]),
        });
        done();
      });
  });

  test.each([
    {
      describe: 'user not found error',
      cause: PrismaNotFoundError,
      expected: {
        message: USER.USER_NOT_FOUND,
      },
      status: HTTP_CODE.NOT_FOUND,
    },
    {
      describe: 'email or phone have already exist',
      cause: PrismaDuplicateError,
      expected: {
        message: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
      },
      status: HTTP_CODE.BAD_REQUEST,
    },
    {
      describe: 'server error',
      cause: ServerError,
      expected: {
        message:COMMON.INTERNAL_ERROR_MESSAGE,
      },
      status: HTTP_CODE.SERVER_ERROR,
    }
  ])('update person failed with $describe', ({ cause, expected, status },done) => {
    expect.hasAssertions();
    globalThis.prismaClient.user.update.mockRejectedValue(cause);
    globalThis.api
      .put(updatePersonUrl)
      .set('authorization', authenticationToken)
      .set('Cookie', [sessionToken])
      .field('firstName', mockUser.first_name)
      .field('lastName', mockUser.last_name)
      .field('email', mockUser.email)
      .field('sex', mockUser.sex)
      .field('phone', mockUser.phone)
      .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
      .expect('Content-Type', /application\/json/)
      .expect(status)
      .then((response) => {
        expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
        expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              user_id: mockUser.user_id
            }),
            data: expect.objectContaining({
              first_name: mockUser.first_name,
              last_name: mockUser.last_name,
              email: mockUser.email,
              sex: mockUser.sex,
              phone: mockUser.phone,
              avatar: expect.any(String),
            })
          })
        );
        expect(response.body).toEqual(expected);
        done();
      });
  });

  test('update person failed with avatar not be image', (done) => {
    expect.hasAssertions();
    globalThis.api
      .put(updatePersonUrl)
      .set('authorization', authenticationToken)
      .set('Cookie', [sessionToken])
      .set('Connection', 'keep-alive')
      .field('firstName', mockUser.first_name)
      .field('lastName', mockUser.last_name)
      .field('email', mockUser.email)
      .field('sex', mockUser.sex)
      .field('phone', mockUser.phone)
      .attach('avatar', getStaticFile('/pdf/pdf-test.pdf'), { contentType: 'application/pdf' })
      .expect('Content-Type', /application\/json/)
      .expect(HTTP_CODE.BAD_REQUEST)
      .then((response) => {
        expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
        expect(response.body).toEqual({
          message: COMMON.FILE_NOT_IMAGE
        });
        done();
      });
  });

  test('update person failed with avatar is empty file', (done) => {
    expect.hasAssertions();
    globalThis.api
      .put(updatePersonUrl)
      .set('authorization', authenticationToken)
      .set('Cookie', [sessionToken])
      .set('Connection', 'keep-alive')
      .field('firstName', mockUser.first_name)
      .field('lastName', mockUser.last_name)
      .field('email', mockUser.email)
      .field('sex', mockUser.sex)
      .field('phone', mockUser.phone)
      .attach('avatar', getStaticFile('/images/empty.png'), { contentType: 'image/png' })
      .expect('Content-Type', /application\/json/)
      .expect(HTTP_CODE.BAD_REQUEST)
      .then((response) => {
        expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
        expect(response.body).toEqual({
          message: COMMON.FILE_IS_EMPTY
        });
        done();
      });
  });

  test('update person failed with output validate error', (done) => {
    expect.hasAssertions();
    globalThis.prismaClient.user.update.mockResolvedValue();

    jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
      () => GraphqlResponse.dto.parse({
        data: {
          message: 'Expected message!'
        }
      })
    );

    globalThis.api
      .put(updatePersonUrl)
      .set('authorization', authenticationToken)
      .set('Cookie', [sessionToken])
      .set('Connection', 'keep-alive')
      .field('firstName', mockUser.first_name)
      .field('lastName', mockUser.last_name)
      .field('email', mockUser.email)
      .field('sex', mockUser.sex)
      .field('phone', mockUser.phone)
      .attach('avatar', getStaticFile('/images/application.png'), { contentType: 'image/png' })
      .expect('Content-Type', /application\/json/)
      .expect(HTTP_CODE.BAD_REQUEST)
      .then((response) => {
        expect(globalThis.prismaClient.user.update).toHaveBeenCalledTimes(1);
        expect(globalThis.prismaClient.user.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              user_id: mockUser.user_id
            }),
            data: expect.objectContaining({
              first_name: mockUser.first_name,
              last_name: mockUser.last_name,
              email: mockUser.email,
              sex: mockUser.sex,
              phone: mockUser.phone,
              avatar: expect.any(String),
            })
          })
        );
        expect(response.body).toEqual({
          message: COMMON.OUTPUT_VALIDATE_FAIL,
        });
        done();
      });
  });
});
