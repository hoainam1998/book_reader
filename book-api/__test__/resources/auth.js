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
  power: 0,
};

const authenticationToken = sign({
  userId: mockUser.user_id,
  email: mockUser.email,
  power: mockUser.power,
},
process.env.SECRET_KEY);
const resetPasswordToken = signingResetPasswordToken(mockUser.email);

module.exports = {
  authenticationToken,
  mockUser,
  resetPasswordToken,
};
