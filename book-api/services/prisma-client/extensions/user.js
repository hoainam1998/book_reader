const { compare } = require('bcrypt');
const { passwordHashing, signingResetPasswordToken, autoGeneratePassword } = require('#utils');

module.exports = (prisma) => {
  return {
    create: async ({ args, query }) => {
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
  };
};
