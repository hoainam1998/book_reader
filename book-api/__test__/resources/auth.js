const { sign } = require('jsonwebtoken');

const user = {
  email: 'namdang201998@gmail.com',
  password: 'namtran9',
  userId: Date.now().toString(),
};

const loginRequireToken = sign({ isLogin: true }, process.env.SECRET_KEY_LOGIN);
const authentication = sign({ userId: user.userId, email: user.email }, process.env.SECRET_KEY);

module.exports = {
  loginRequireToken,
  authentication,
};
