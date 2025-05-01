const { signingResetPasswordToken, generateOtp, signLoginToken } = require('#utils');
const { POWER } = require('#constants');

const mockUser = {
  user_id: Date.now().toString(),
  first_name: 'nguyen',
  last_name: 'nam',
  email: 'namdang201999@gmail.com',
  avatar: 'avatar',
  mfa_enable: true,
  password: 'namtran9',
  otp_code: generateOtp(),
  power: 0,
  phone: '0987654321',
  sex: 0,
  role: ''
};

const authenticationToken = signLoginToken(mockUser.user_id, mockUser.email, mockUser.power);
const resetPasswordToken = signingResetPasswordToken(mockUser.email);
const otpCode = generateOtp();

/**
 * Call request to sign session data for testing.
 *
 * @param {{
 * email: string,
 * apiKey: string,
 * role: string,
 * mfaEnable: boolean
 * }} sessionJson - express request.
 * @return {Promise} - The supertest promise.
 */
const signedTestCookie = (sessionJson) => {
  return globalThis.api.post('/signed-test-cookie').send(sessionJson);
};

const sessionData = {
  user: {
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
  signedTestCookie,
};
