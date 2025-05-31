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

      args.data = {
        ...args.data,
        password,
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
