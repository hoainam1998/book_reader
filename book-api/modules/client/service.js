const Service = require('#services/prisma');
const { GraphQLError } = require('graphql');
const { compare } = require('bcrypt');
const {
  UpdateFavoriteBooksEvent,
  UpdateReadLateBooksEvent,
  UpdateUsedReadBooksEvent,
} = require('#services/redis-client/events/events');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { signClientResetPasswordToken, autoGeneratePassword, checkArrayHaveValues, calcPages } = require('#utils');
const { graphqlNotFoundErrorOption, graphqlNotPermissionErrorOption } = require('../common-schema');
const { READER } = require('#messages');
const { BLOCK, PRISMA_ERROR_CODE, REDIS_KEYS } = require('#constants');

class ClientService extends Service {
  constructor(prismaClient, redisClient) {
    super(prismaClient, redisClient);
    this.subscribers();
  }

  signUp(firstName, lastName, email, password, sex) {
    const resetToken = signClientResetPasswordToken(email);
    return this.PrismaInstance.reader.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        sex,
        reset_password_token: resetToken,
      },
    });
  }

  updateCacheClientInformation(clientId) {
    return this.getClientDetail(clientId, {
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      sex: true,
      phone: true,
      avatar: true,
    }).then(async (client) => {
      await this.RedisClient.Client.json.merge(`${REDIS_KEYS.CLIENT}:${clientId}`, '$', client);
      return client;
    });
  }

  update(client) {
    const { clientId, firstName, lastName, avatar, email, sex, phone } = client;
    return this.PrismaInstance.reader
      .update({
        where: {
          reader_id: clientId,
        },
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar,
          email,
          sex,
          phone,
        },
      })
      .then(async (client) => {
        await this.updateCacheClientInformation(clientId);
        return client;
      });
  }

  forgetPassword(email) {
    const resetToken = signClientResetPasswordToken(email);
    const randomPassword = autoGeneratePassword();
    return this.PrismaInstance.reader
      .findUniqueOrThrow({
        where: {
          email,
        },
        select: {
          blocked: true,
        },
      })
      .then((user) => {
        if (user.blocked === BLOCK.ON) {
          throw new GraphQLError(READER.YOU_ARE_BLOCK, graphqlNotPermissionErrorOption);
        }
        return this.PrismaInstance.reader
          .update({
            where: {
              email,
            },
            data: {
              reset_password_token: resetToken,
              password: randomPassword,
            },
          })
          .then((client) => ({ ...client, plain_password: randomPassword }));
      });
  }

  resetPassword(token, email, oldPassword, password) {
    return this.PrismaInstance.reader
      .findFirstOrThrow({
        where: {
          reset_password_token: token,
          email,
        },
        select: {
          password: true,
          blocked: true,
        },
      })
      .then(async (client) => {
        if (client.blocked === BLOCK.ON) {
          throw new GraphQLError(READER.YOU_ARE_BLOCK, graphqlNotPermissionErrorOption);
        }
        if (await compare(oldPassword, client.password)) {
          return this.PrismaInstance.reader.update({
            where: {
              email,
              reset_password_token: token,
            },
            data: {
              password,
              reset_password_token: null,
            },
          });
        }
        throw new PrismaClientKnownRequestError(READER.OLD_PASSWORD_NOT_MATCH, {
          code: PRISMA_ERROR_CODE.UNAUTHORIZED,
        });
      });
  }

  getClientDetail(emailOrId, select) {
    return this.PrismaInstance.reader.findFirstOrThrow({
      where: {
        OR: [
          {
            email: emailOrId,
          },
          {
            reader_id: emailOrId,
          },
        ],
      },
      select,
    });
  }

  login(email, password, select) {
    select = { ...select, password: true, blocked: true };
    return this.getClientDetail(email, select).then(async (client) => {
      if (client.blocked === BLOCK.ON) {
        throw new GraphQLError(READER.YOU_ARE_BLOCK, graphqlNotPermissionErrorOption);
      } else if (await compare(password, client.password)) {
        return client;
      }
      throw new PrismaClientKnownRequestError(READER.PASSWORD_NOT_MATCH, { code: PRISMA_ERROR_CODE.UNAUTHORIZED });
    });
  }

  async detail(clientId, select) {
    if ((await this.RedisClient.Client.exists(`${REDIS_KEYS.CLIENT}:${clientId}`)) > 0) {
      const [client] = await this.RedisClient.Client.json.get(`${REDIS_KEYS.CLIENT}:${clientId}`, { path: '$' });
      return client;
    }

    return this.getClientDetail(clientId, select).then(async (client) => {
      await this.RedisClient.Client.del(`${REDIS_KEYS.CLIENT}:${clientId}`).then(() => {
        return this.RedisClient.Client.json.set(`${REDIS_KEYS.CLIENT}:${clientId}`, '$', client);
      });
      return client;
    });
  }

  all(exclude, select) {
    const excludeWhere = exclude
      ? {
          where: {
            reader_id: {
              not: exclude,
            },
          },
        }
      : {};
    return this.PrismaInstance.reader
      .findMany({
        ...excludeWhere,
        select,
      })
      .then((result) => {
        if (!checkArrayHaveValues(result)) {
          graphqlNotFoundErrorOption.response = [];
          throw new GraphQLError(READER.USER_NOT_FOUND, graphqlNotFoundErrorOption);
        }
        return result;
      });
  }

  pagination(pageSize, pageNumber, keyword, select) {
    const offset = (pageNumber - 1) * pageSize;
    let paginationResultPromise;
    if (keyword) {
      paginationResultPromise = this.PrismaInstance.$transaction([
        this.PrismaInstance.reader.findMany({
          select,
          where: {
            OR: [
              {
                last_name: {
                  contains: keyword,
                },
              },
              {
                first_name: {
                  contains: keyword,
                },
              },
            ],
          },
          orderBy: {
            reader_id: 'desc',
          },
          take: pageSize,
          skip: offset,
        }),
        this.PrismaInstance.reader.count({
          where: {
            OR: [
              {
                last_name: {
                  contains: keyword,
                },
              },
              {
                first_name: {
                  contains: keyword,
                },
              },
            ],
          },
        }),
      ]);
    } else {
      paginationResultPromise = this.PrismaInstance.$transaction([
        this.PrismaInstance.reader.findMany({
          select,
          orderBy: {
            reader_id: 'desc',
          },
          take: pageSize,
          skip: offset,
        }),
        this.PrismaInstance.reader.count(),
      ]);
    }

    return paginationResultPromise.then((clients) => {
      const total = clients[1];
      const pages = calcPages(pageSize, total);

      if (!checkArrayHaveValues(clients[0])) {
        graphqlNotFoundErrorOption.response = {
          list: [],
          total: 0,
          page: pageNumber,
          pages,
          pageSize,
        };
        throw new GraphQLError(READER.READERS_EMPTY, graphqlNotFoundErrorOption);
      }

      clients.push(pages);
      return clients;
    });
  }

  blockReader(clientId, state) {
    return this.PrismaInstance.reader.update({
      where: {
        reader_id: clientId,
      },
      data: {
        blocked: state,
      },
    });
  }

  subscribers() {
    this.RedisClient.subscribe(UpdateFavoriteBooksEvent.eventName, (msg) => {
      const messageJson = UpdateFavoriteBooksEvent.fromJson(msg);
      const payload = messageJson.payload;
      const senderId = messageJson.senderId;
      this.RedisClient.Client.json.set(`${REDIS_KEYS.CLIENT}:${senderId}`, '$.favorite_books', payload);
    });

    this.RedisClient.subscribe(UpdateReadLateBooksEvent.eventName, (msg) => {
      const messageJson = UpdateReadLateBooksEvent.fromJson(msg);
      const payload = messageJson.payload;
      const senderId = messageJson.senderId;
      this.RedisClient.Client.json.set(`${REDIS_KEYS.CLIENT}:${senderId}`, '$.read_late', payload);
    });

    this.RedisClient.subscribe(UpdateUsedReadBooksEvent.eventName, (msg) => {
      const messageJson = UpdateUsedReadBooksEvent.fromJson(msg);
      const payload = messageJson.payload;
      const senderId = messageJson.senderId;
      this.RedisClient.Client.json.set(`${REDIS_KEYS.CLIENT}:${senderId}`, '$.used_read', payload);
    });
  }
}

module.exports = ClientService;
