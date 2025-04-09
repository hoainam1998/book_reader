const { sign } = require('jsonwebtoken');
const { signingResetPasswordToken } = require('#utils');

const mockUser = {
  user_id: Date.now().toString(),
  first_name: 'nguyen',
  last_name: 'nam',
  email: 'namdang201999@gmail.com',
  avatar: 'avatar',
  mfa_enable: true,
  password: 'namtran9',
};

const loginRequireToken = sign({ isLogin: true }, process.env.SECRET_KEY_LOGIN);
const authentication = sign({ userId: mockUser.user_id, email: mockUser.email }, process.env.SECRET_KEY);
const resetPasswordToken = signingResetPasswordToken(mockUser.email);

module.exports = {
  loginRequireToken,
  authentication,
  mockUser,
  resetPasswordToken,
};
