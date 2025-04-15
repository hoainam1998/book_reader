const jwt = require('jsonwebtoken');
const { genSalt, hash } = require('bcrypt');

/**
 * Generate the new password.
 *
 * @param {string} email - The register email.
 * @param {string} [expires='1h'] - The register email.
 * @return {string} - The reset password token.
 */
const signingResetPasswordToken = (email, expires = '1h') => {
  return jwt.sign(
    { email },
    process.env.ADMIN_RESET_PASSWORD_SECRET_KEY,
    { expiresIn: expires }
  );
};

/**
 * Verify reset password token.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @return {boolean} - The verify result.
 */
const verifyResetPasswordToken = (resetPasswordToken) => jwt.verify(resetPasswordToken, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);

/**
 * Signing login token with payload is email and userId.
 *
 * @param {string} userId - The userId.
 * @param {string} email - An email.
 * @return {string} - The login token.
 */
const signLoginToken = (userId, email, power) => jwt.sign({ userId, email, power }, process.env.SECRET_KEY, { expiresIn: '1h' });

/**
 * Verify login token.
 *
 * @param {string} loginToken - The login token.
 * @return {string} - The data decoded.
 */
const verifyLoginToken = (loginToken) => jwt.verify(loginToken, process.env.SECRET_KEY);

/**
 * Hashing password
 *
 * @async
 * @param {string} password - The password.
 * @return {Promise<string>} -The password decoded.
 */
const passwordHashing = async (password) => {
  const saltRound = await genSalt(10);
  return await hash(password, saltRound);
};

/**
 * Generate the new password.
 *
 * @return {string} - The new password.
 */
const autoGeneratePassword = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let password = '';

  for (let i = 0; i < 8; i++) {
    const index = Math.floor(Math.random() * chars.length);
    password += chars.charAt(index);
  }
  return password;
};

/**
 * Return otp code.
 *
 * @return {string} - otp number.
 */
const generateOtp = () => {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

module.exports = {
  signingResetPasswordToken,
  passwordHashing,
  autoGeneratePassword,
  generateOtp,
  verifyResetPasswordToken,
  signLoginToken,
  verifyLoginToken,
};
