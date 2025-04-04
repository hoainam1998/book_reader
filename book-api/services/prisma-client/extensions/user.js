const { sign } = require('jsonwebtoken');
const { compare } = require('bcrypt');
const { passwordHashing } = require('#utils');

/**
 * Generate the new password.
 *
 * @return {string} - The new password.
 */
const autoGeneratePassword = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let password = '';

  for (let i = 0; i < 8; i++) {
    const index = Math.round(Math.random() * chars.length);
    password += chars.charAt(index);
  }
  return password;
};

/**
 * Signing login token with payload is email and userId.
 *
 * @param {string} userId - The userId.
 * @param {string} email - An email.
 * @return {string} - The login token.
 */
const signLoginToken = (userId, email) => sign({ userId, email }, process.env.SECRET_KEY);

module.exports = (prisma) => {
  return {
    create: async ({ args, query }) => {
      const firstLoginPassword = autoGeneratePassword();
      const userId = Date.now().toString();
      const password = await passwordHashing(firstLoginPassword);
      const token = signLoginToken(userId, args.data.email);
      const resetPasswordToken = sign(
        { email: args.data.email },
        process.env.ADMIN_RESET_PASSWORD_SECRET_KEY,
        { expiresIn: '1h' }
      );

      args.data = {
        ...args.data,
        user_id: userId,
        login_token: token,
        password,
        reset_password_token: resetPasswordToken,
      };

      return {
        ...await query(args),
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
            user_id: true
          },
        });
      }

      if (oldUser) {
        if (args.data.password) {
          if (!await compare(args.data.password, oldUser.password)) {
            args.data.password = await passwordHashing(args.data.password);
          }
        }

        if (args.data.email) {
          if (args.data.email !== oldUser.email) {
            args.data.login_token = signLoginToken(oldUser.user_id, args.data.email);
          }
        }
      }

      return await query(args);
    },
  };
};
