const { compare } = require('bcrypt');
const { passwordHashing } = require('#utils');
const { BLOCK, PRISMA_ERROR_CODE, SEX } = require('#constants');
const { READER, USER } = require('#messages');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

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

      if (args.data.sex && !Object.values(SEX).includes(args.data.sex)) {
        throw new PrismaClientKnownRequestError(USER.YOUR_GENDER_INVALID, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
      }

      args.data = {
        ...args.data,
        password,
        reader_id: Date.now().toString(),
      };

      return await query(args);
    },

    update: async ({ args, query }) => {
      let condition;

      if (args.data.sex && !Object.values(SEX).includes(args.data.sex)) {
        throw new PrismaClientKnownRequestError(USER.YOUR_GENDER_INVALID, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
      }

      if (args.data.blocked && !Object.values(BLOCK).includes(args.data.blocked)) {
        throw new PrismaClientKnownRequestError(READER.BLOCK_STATE_INVALID, {
          code: PRISMA_ERROR_CODE.DATA_VALIDATION,
        });
      }

      if (args.where.reader_id) {
        condition = { reader_id: args.where.reader_id };
      } else if (args.where.email) {
        condition = { email: args.where.email };
      }

      const oldUser = await prisma.reader.findUnique({
        where: condition,
      });

      if (args.data.password) {
        if (!(await compare(args.data.password, oldUser.password))) {
          args.data.password = await passwordHashing(args.data.password);
        } else {
          args.data.password = oldUser.password;
        }
      }

      return await query(args);
    },
  };
};
