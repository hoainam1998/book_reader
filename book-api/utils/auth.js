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
 * @return {object} - The verify result.
 */
const verifyResetPasswordToken = (resetPasswordToken) => jwt.verify(resetPasswordToken, process.env.ADMIN_RESET_PASSWORD_SECRET_KEY);

/**
 * Verify client reset password token.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @return {object} - The verify result.
 */
const verifyClientResetPasswordToken = (resetPasswordToken) => jwt.verify(resetPasswordToken, process.env.CLIENT_RESET_PASSWORD_SECRET_KEY);

/**
 * Signing login token with payload is email and userId.
 *
 * @param {string} userId - The userId.
 * @param {string} email - An email register.
 * @return {string} - The login token.
 */
const signLoginToken = (userId, email, power) => jwt.sign({ userId, email, power }, process.env.SECRET_KEY, { expiresIn: '1h' });

/**
 * Signing client login token with payload is email.
 *
 * @param {string} email - An email register.
 * @return {string} - The client login token.
 */
const signClientLoginToken = (email) => jwt.sign({ email }, process.env.CLIENT_LOGIN_SECRET_KEY);

/**
 * Verify client login token.
 *
 * @param {string} clientLoginToken - The client login token.
 * @return {object} - The data decoded.
 */
const verifyClientLoginToken = (clientLoginToken) => jwt.verify(clientLoginToken, process.env.CLIENT_LOGIN_SECRET_KEY);

/**
 * Signing client reset password token.s
 *
 * @param {string} email - An email register.
 * @return {string} - The client reset password token.
 */
const signClientResetPasswordToken = (email) => jwt.sign({ email }, process.env.CLIENT_RESET_PASSWORD_SECRET_KEY, { expiresIn: '1h' });

/**
 * Verify login token.
 *
 * @param {string} loginToken - The login token.
 * @return {object} - The data decoded.
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
  signClientResetPasswordToken,
  signClientLoginToken,
  passwordHashing,
  autoGeneratePassword,
  generateOtp,
  verifyResetPasswordToken,
  verifyClientResetPasswordToken,
  signLoginToken,
  verifyLoginToken,
  verifyClientLoginToken,
};
