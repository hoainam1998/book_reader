const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { PRISMA_ERROR_CODE, HTTP_CODE, POWER, POWER_NUMERIC } = require('#constants');
const { USER } = require('#messages');
const { messageCreator } = require('#utils');

/**
 * The ioc service class, it will be share with all route.
 *
 * @class
 */
class SharedService {
  _prismaClient;

  /**
   * Create test server instance.
   *
   * @constructs
   * @param {object} prismaClient - The prisma client instance.
   */
  constructor(prismaClient) {
    this._prismaClient = prismaClient;
  }

  /**
   * Return a prisma client.
   *
   * @constructs
   * @return {object} - The prisma client.
   */
  get PrismaClient() {
    return this._prismaClient;
  }

  updateUserSessionId(sessionId, userId) {
    return this.PrismaClient.user
      .update({
        where: {
          user_id: userId,
        },
        data: {
          session_id: sessionId,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === PRISMA_ERROR_CODE.RECORD_NOT_FOUND) {
            throw {
              status: HTTP_CODE.UNAUTHORIZED,
              ...messageCreator(USER.USER_NOT_FOUND),
            };
          }
        }
        throw error;
      });
  }

  updateClientSessionId(sessionId, clientId) {
    return this.PrismaClient.reader
      .update({
        where: {
          reader_id: clientId,
        },
        data: {
          session_id: sessionId,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === PRISMA_ERROR_CODE.RECORD_NOT_FOUND) {
            throw {
              status: HTTP_CODE.UNAUTHORIZED,
              ...messageCreator(USER.USER_NOT_FOUND),
            };
          }
        }
        throw error;
      });
  }

  deleteUserSessionId(userId) {
    const where = {
      user_id: userId,
    };

    return this.PrismaClient.user
      .findFirstOrThrow({
        where,
        select: {
          session_id: true,
        },
      })
      .then((user) => {
        return this.PrismaClient.user
          .update({
            where,
            data: {
              session_id: null,
            },
          })
          .then(() => user);
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === PRISMA_ERROR_CODE.RECORD_NOT_FOUND) {
            throw {
              status: HTTP_CODE.NOT_FOUND,
              ...messageCreator(USER.USER_NOT_FOUND),
            };
          }
        }
        throw error;
      });
  }

  checkYouHaveRightPermission(you, targetUserId) {
    if (you.userId === targetUserId) {
      return Promise.reject({
        status: HTTP_CODE.NOT_PERMISSION,
        ...messageCreator(USER.NOT_PERMISSION),
      });
    }
    return this.PrismaClient.user
      .findUniqueOrThrow({
        where: {
          user_id: targetUserId,
        },
        select: {
          power: true,
        },
      })
      .then((user) => {
        if (you.role === POWER.ADMIN && user.power > POWER_NUMERIC.USER) {
          throw {
            status: HTTP_CODE.NOT_PERMISSION,
            ...messageCreator(USER.NOT_PERMISSION),
          };
        }
        return user;
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === PRISMA_ERROR_CODE.RECORD_NOT_FOUND) {
            throw {
              status: HTTP_CODE.NOT_FOUND,
              ...messageCreator(USER.USER_NOT_FOUND),
            };
          }
        }
        throw error;
      });
  }

  deleteClientSessionId(clientId) {
    const where = {
      reader_id: clientId,
    };

    return this.PrismaClient.reader
      .findUniqueOrThrow({
        where,
        select: {
          session_id: true,
        },
      })
      .then((client) => {
        return this.PrismaClient.reader
          .update({
            where,
            data: {
              session_id: null,
            },
          })
          .then(() => client);
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === PRISMA_ERROR_CODE.RECORD_NOT_FOUND) {
            throw {
              status: HTTP_CODE.NOT_FOUND,
              ...messageCreator(USER.USER_NOT_FOUND),
            };
          } else if (error.code === PRISMA_ERROR_CODE.DATA_VALIDATION) {
            throw {
              status: HTTP_CODE.BAD_REQUEST,
              ...messageCreator(error.message),
            };
          }
        }
        throw error;
      });
  }
}

module.exports = SharedService;
