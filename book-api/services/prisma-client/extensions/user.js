const { sign } = require('jsonwebtoken');
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

module.exports = (prisma) => {
  return {
    create: async ({ args, query }) => {
      const firstLoginPassword = autoGeneratePassword();
      const userId = Date.now().toString();
      const password = await passwordHashing(firstLoginPassword);
      const token = sign({ userId, email: args.data.email }, process.env.SECRET_KEY);
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
  };
};
