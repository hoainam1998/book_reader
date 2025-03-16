const { genSalt, hash } = require('bcrypt');
const { sign } = require('jsonwebtoken');

module.exports = {
  async create({ model, operation, args, query }) {
    const saltRound = await genSalt(10);
    const password = await hash(args.data.password, saltRound);
    const token = sign(
      { email: args.data.email },
      process.env.CLIENT_SECRET_KEY
    );
    args.data = {
      ...args.data,
      password,
      login_token: token,
      reader_id: Date.now().toString(),
    };
    return query(args);
  },
};
