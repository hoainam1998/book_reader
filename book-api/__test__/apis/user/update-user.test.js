const { PrismaNotFoundError, PrismaDuplicateError } = require('#test/mocks/prisma-error');
const GraphqlResponse = require('#dto/common/graphql-response');
const { HTTP_CODE, METHOD, PATH, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { mockUser, authenticationToken, sessionData, signedTestCookie } = require('#test/resources/auth');
const commonTest = require('#test/apis/common/common');
const { getInputValidateMessage, createDescribeTest } = require('#test/helpers/index');
const updateUserUrl = `${PATH.USER}/update-user`;

describe(createDescribeTest(METHOD.POST, updateUserUrl), () => {
  commonTest('update user common test', [
    {
      name: 'url test',
      describe: 'url is invalid',
      url: `${PATH.USER}/unknown`,
      method: METHOD.POST.toLowerCase(),
    },
    {
      name: 'method test',
      describe: 'method not allowed',
      url: updateUserUrl,
      method: METHOD.GET.toLowerCase(),
    },
    {
      name: 'cors test',
      describe: 'update user api cors',
      url: updateUserUrl,
      method: METHOD.POST.toLowerCase(),
      origin: process.env.ORIGIN_CORS,
    }
  ], 'verify otp common test');

  test('update user will be success', (done) => {
    signedTestCookie(sessionData.user)
      .then((responseApiSignin) => {
        const sessionToken = responseApiSignin.header['set-cookie'];
        globalThis.prismaClient.user.update.mockResolvedValue();
        globalThis.api
          .put(updateUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [sessionToken])
          .send({
            userId: mockUser.user_id,
            firstName: mockUser.first_name,
            lastName:  mockUser.last_name,
            email: mockUser.email,
            sex: mockUser.sex,
            phone: mockUser.phone,
            mfa: true,
            power: true,
          })
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
                  mfa_enable: true,
                  power: true,
                })
              })
            );
            expect(response.body).toMatchObject({
              message: USER.UPDATE_USER_SUCCESS
            });
            done();
          });
      });
  });

  test('update user failed with authentication error', (done) => {
    globalThis.api
      .put(updateUserUrl)
      .set('authorization', authenticationToken)
      .send({
        userId: mockUser.user_id,
        firstName: mockUser.first_name,
        lastName:  mockUser.last_name,
        email: mockUser.email,
        sex: mockUser.sex,
        phone: mockUser.phone,
        mfa: true,
        power: true,
      })
      .expect('Content-Type', /application\/json/)
      .expect(HTTP_CODE.UNAUTHORIZED)
      .then((response) => {
        expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
        expect(response.body).toMatchObject({
          message: expect.any(String)
        });
        done();
      });
  });

  test('update user failed with wrong permission error', (done) => {
    signedTestCookie({ ...sessionData.user, role: POWER.USER })
    .then((responseApiSignin) => {
      const sessionToken = responseApiSignin.header['set-cookie'];
      globalThis.api
        .put(updateUserUrl)
        .set('authorization', authenticationToken)
        .set('Cookie', [sessionToken])
        .send({
          userId: mockUser.user_id,
          firstName: mockUser.first_name,
          lastName:  mockUser.last_name,
          email: mockUser.email,
          sex: mockUser.sex,
          phone: mockUser.phone,
          mfa: true,
          power: true,
        })
        .expect('Content-Type', /application\/json/)
        .expect(HTTP_CODE.NOT_PERMISSION)
        .then((response) => {
          expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
          expect(response.body).toMatchObject({
            message: USER.NOT_PERMISSION
          });
          done();
        });
    });
  });

  test('update user failed with bad request', (done) => {
    // missing email field.
    signedTestCookie(sessionData.user)
      .then((responseApiSignin) => {
        const sessionToken = responseApiSignin.header['set-cookie'];
        globalThis.api
          .put(updateUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [sessionToken])
          .send({
            userId: mockUser.user_id,
            firstName: mockUser.first_name,
            lastName:  mockUser.last_name,
            sex: mockUser.sex,
            phone: mockUser.phone,
            mfa: true,
            power: true,
          })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
            expect(globalThis.prismaClient.user.update).not.toHaveBeenCalled();
            expect(response.body).toMatchObject({
              message: getInputValidateMessage(USER.UPDATE_USER_FAIL)
            });
            done();
          });
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
      cause: new Error('Server error!'),
      expected: {
        message:COMMON.INTERNAL_ERROR_MESSAGE,
      },
      status: HTTP_CODE.SERVER_ERROR,
    }
  ])('update user failed with $describe', ({ cause, expected, status }, done) => {
    globalThis.prismaClient.user.update.mockRejectedValue(cause);

    signedTestCookie(sessionData.user)
      .then((responseApiSignin) => {
        const sessionToken = responseApiSignin.header['set-cookie'];
        globalThis.api
          .put(updateUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [sessionToken])
          .send({
            userId: mockUser.user_id,
            firstName: mockUser.first_name,
            lastName:  mockUser.last_name,
            email: mockUser.email,
            sex: mockUser.sex,
            phone: mockUser.phone,
            mfa: true,
            power: true,
          })
          .expect('Content-Type', /application\/json/)
          .expect(status)
          .then((response) => {
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
                })
              })
            );
            expect(response.body).toMatchObject(expected);
            done();
          });
      });
  });

  test('update user failed with output validate error', (done) => {
    jest.spyOn(GraphqlResponse, 'parse').mockImplementation(
      () => GraphqlResponse.dto.parse({
        data: {
          message: 'Expected message'
        }
      })
    );

    globalThis.prismaClient.user.update.mockResolvedValue(mockUser);

    signedTestCookie(sessionData.user)
      .then((responseApiSignin) => {
        const sessionToken = responseApiSignin.header['set-cookie'];
        globalThis.api
          .put(updateUserUrl)
          .set('authorization', authenticationToken)
          .set('Cookie', [sessionToken])
          .send({
            userId: mockUser.user_id,
            firstName: mockUser.first_name,
            lastName:  mockUser.last_name,
            email: mockUser.email,
            sex: mockUser.sex,
            phone: mockUser.phone,
            mfa: true,
            power: true,
          })
          .expect('Content-Type', /application\/json/)
          .expect(HTTP_CODE.BAD_REQUEST)
          .then((response) => {
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
                })
              })
            );
            expect(response.body).toMatchObject({
              message: COMMON.OUTPUT_VALIDATE_FAIL,
            });
            done();
          });
      });
  });
});
