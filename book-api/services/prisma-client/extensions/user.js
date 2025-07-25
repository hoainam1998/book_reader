const { compare } = require('bcrypt');
const { passwordHashing, signingResetPasswordToken, autoGeneratePassword } = require('#utils');
const { POWER_NUMERIC, PRISMA_ERROR_CODE, SEX, VALID_POWER_NUMERIC } = require('#constants');
const { USER } = require('#messages');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

const VALID_POWER = Object.values(VALID_POWER_NUMERIC);

module.exports = (prisma) => {
  return {
    create: async ({ args, query }) => {
      if (args.data.sex && !Object.values(SEX).includes(args.data.sex)) {
        throw new PrismaClientKnownRequestError(USER.YOUR_GENDER_INVALID, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
      }

      if (args.data.power) {
        if (args.data.power === POWER_NUMERIC.SUPER_ADMIN) {
          throw new PrismaClientKnownRequestError(USER.CAN_NOT_CREATE_SUPER_ADMIN, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
        } else if (!Object.values(VALID_POWER).includes(args.data.power)) {
          throw new PrismaClientKnownRequestError(USER.YOUR_POWER_INVALID, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
        }
      }

      const firstLoginPassword = autoGeneratePassword();
      const userId = Date.now().toString();
      const password = await passwordHashing(firstLoginPassword);
      const resetPasswordToken = signingResetPasswordToken(args.data.email);

      args.data = {
        ...args.data,
        user_id: userId,
        password,
        reset_password_token: resetPasswordToken,
      };

      return {
        ...(await query(args)),
        plain_password: firstLoginPassword,
      };
    },
    update: async ({ args, query }) => {
      let condition;
      let oldUser;

      if (args.data.sex && !Object.values(SEX).includes(args.data.sex)) {
        throw new PrismaClientKnownRequestError(USER.YOUR_GENDER_INVALID, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
      }

      if (args.data.power) {
        if (args.data.power === POWER_NUMERIC.SUPER_ADMIN) {
          throw new PrismaClientKnownRequestError(USER.CAN_NOT_CREATE_SUPER_ADMIN, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
        } else if (!Object.values(POWER_NUMERIC).includes(args.data.power)) {
          throw new PrismaClientKnownRequestError(USER.VALID_POWER, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
        }
      }

      if (args.where.user_id) {
        condition = { user_id: args.where.user_id };
      } else if (args.where.email) {
        condition = { email: args.where.email };
      }

      if (condition) {
        oldUser = await prisma.user.findUnique({
          where: condition,
          select: {
            email: true,
            password: true,
            user_id: true,
            reset_password_token: true,
          },
        });
      }

      if (oldUser) {
        if (args.data.password) {
          if (!(await compare(args.data.password, oldUser.password))) {
            args.data.password = await passwordHashing(args.data.password);
          }
        }
      }

      return await query(args);
    },
    delete: async ({ args, query }) => {
      let deleteUser;

      if (args.where.user_id) {
        deleteUser = await prisma.user.findUnique({
          where: {
            user_id: args.where.user_id,
          },
          select: {
            power: true,
          },
        });
      }

      if (deleteUser) {
        if (deleteUser.power !== POWER_NUMERIC.SUPER_ADMIN) {
          return await query(args);
        } else {
          throw new PrismaClientKnownRequestError(USER.CAN_NOT_DELETE_SUPER_ADMIN, { code: PRISMA_ERROR_CODE.DATA_VALIDATION });
        }
      } else {
        throw new PrismaClientKnownRequestError(USER.USER_NOT_FOUND, { code: PRISMA_ERROR_CODE.RECORD_NOT_FOUND });
      }
    }
  };
};
