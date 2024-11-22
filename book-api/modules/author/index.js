const AuthorService = require('./service');
const { query, mutation } = require('./schema');

module.exports = (sql) => {
  const service = new AuthorService(sql);
  return {
    query: {
      type: query,
      resolve: () => service
    },
    mutation: {
      type: mutation,
      resolve: () => service
    }
  }
};
