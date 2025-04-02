const { sign } = require('jsonwebtoken');
const { compare } = require('bcrypt');
const { passwordHashing } = require('#utils');

/**
 * Return reader prisma extension.
 *
 * @param {PrismaClient} prisma - The prisma client instance.
 * @return {Object} The query methods.
 */
module.exports = (prisma) => {
  return {
    create: async ({ args, query }) => {
      const password = await passwordHashing(args.data.password);
      const token = sign(
        { email: args.data.email },
        process.env.CLIENT_LOGIN_SECRET_KEY
      );

      args.data = {
        ...args.data,
        password,
        login_token: token,
        reader_id: Date.now().toString(),
      };

      return query(args);
    },

    update: async ({ args, query }) => {
      const oldUser = await prisma.reader.findUnique({
        where: {
          email: args.where.email
        }
      });

      if (args.data.email && args.data.email !== oldUser.email) {
        args.data.email = sign(
          { email: args.data.email },
          process.env.CLIENT_LOGIN_SECRET_KEY
        );
      }

      if (args.data.password) {
        if (!await compare(args.data.password, oldUser.password)) {
          args.data.password = await passwordHashing(args.data.password);
        } else {
          args.data.password = oldUser.password;
        }
      }

      return query(args);
    }
  };
};
