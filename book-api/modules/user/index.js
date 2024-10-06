const { query, mutation } = require('./schema');
const UserService = require('./service');

module.exports = (sql) => {
  const service = new UserService(sql);

  return {
    query: {
      resolve: () => service,
      type: query
    },
    mutation: {
      resolve: () => service,
      type: mutation
    }
  };
};
