const { signingResetPasswordToken, generateOtp, signLoginToken, autoGeneratePassword } = require('#utils');
const { POWER, RESET_PASSWORD_URL } = require('#constants');

const mockUser = {
  user_id: Date.now().toString(),
  first_name: 'nguyen',
  last_name: 'nam',
  email: 'namdang201999@gmail.com',
  avatar: 'avatar',
  mfa_enable: true,
  password: 'namtran9',
  otp_code: generateOtp(),
  power: true,
  phone: '0987654321',
  sex: 0,
  role: POWER.ADMIN,
  reset_password_token: signingResetPasswordToken('namdang201999@gmail.com'),
};

const authenticationToken = signLoginToken(mockUser.user_id, mockUser.email, mockUser.power);
const resetPasswordToken = signingResetPasswordToken(mockUser.email);
const otpCode = generateOtp();
const randomPassword = autoGeneratePassword();

/**
 * Call request to sign session data for testing.
 *
 * @param {{
 * email: string,
 * apiKey: string,
 * role: string,
 * mfaEnable: boolean
 * }} sessionJson - express request.
 * @param {string} [name="user"] - The session name.
 * @return {Promise} - The supertest promise.
 */
const signedTestCookie = (sessionJson, name = 'user') => {
  return globalThis.api.post(`/signed-test-cookie?name=${name}`).send(sessionJson);
};

/**
 * Call request to clear all session for testing.
 *
 * @return {Promise} - The supertest promise.
 */
const clearAllSession = () => {
  return globalThis.api.get('/clear-all-session');
};

/**
 * Call request to destroy session for testing.
 *
 * @return {Promise} - The supertest promise.
 */
const destroySession = () => {
  return globalThis.api.get('/destroy-session');
};

/**
 * Return reset password link.
 *
 * @param {string} resetPasswordToken - The reset password token.
 * @return {string} - The reset password link.
 */
const getResetPasswordLink = (resetPasswordToken) => RESET_PASSWORD_URL.format(resetPasswordToken);

const sessionData = {
  user: {
    userId: mockUser.user_id,
    email: mockUser.email,
    apiKey: authenticationToken,
    role: POWER.ADMIN,
    mfaEnable: mockUser.mfa_enable
  },
};

module.exports = {
  authenticationToken,
  sessionData,
  mockUser,
  resetPasswordToken,
  otpCode,
  randomPassword,
  signedTestCookie,
  destroySession,
  clearAllSession,
  getResetPasswordLink,
};
