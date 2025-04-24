const { signingResetPasswordToken, generateOtp, signLoginToken } = require('#utils');

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
};

const authenticationToken = signLoginToken(mockUser.user_id, mockUser.email, mockUser.power);
const resetPasswordToken = signingResetPasswordToken(mockUser.email);
const otpCode = generateOtp();

module.exports = {
  authenticationToken,
  mockUser,
  resetPasswordToken,
  otpCode,
};
