const { HTTP_CODE, POWER } = require('#constants');
const { USER, COMMON } = require('#messages');
const { sessionData } = require('#test/resources/auth');
const onlyAdminAllowed = require('#middlewares/auth/only-admin-allowed');

module.exports = describe('admin allowed', () => {
  test('user with admin role will be passed', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: sessionData,
    };

    onlyAdminAllowed(
      globalThis.expressMiddleware.req,
      globalThis.expressMiddleware.res,
      globalThis.expressMiddleware.next
    );
    expect(globalThis.expressMiddleware.next).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.next).toHaveBeenCalled();
    done();
  });

  test('user execute an operation failed without admin role', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: {
        user: {
          ...sessionData.user,
          role: POWER.USER,
        },
      },
    };

    onlyAdminAllowed(
      globalThis.expressMiddleware.req,
      globalThis.expressMiddleware.res,
      globalThis.expressMiddleware.next
    );
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.NOT_PERMISSION);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: USER.NOT_PERMISSION,
      })
    );
    done();
  });

  test('user execute an operation failed with unknown error', (done) => {
    expect.hasAssertions();
    globalThis.expressMiddleware.req = {
      ...globalThis.expressMiddleware.req,
      session: {},
    };

    onlyAdminAllowed(
      globalThis.expressMiddleware.req,
      globalThis.expressMiddleware.res,
      globalThis.expressMiddleware.next
    );
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.status).toHaveBeenCalledWith(HTTP_CODE.SERVER_ERROR);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledTimes(1);
    expect(globalThis.expressMiddleware.res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: COMMON.INTERNAL_ERROR_MESSAGE,
      })
    );
    done();
  });
});
