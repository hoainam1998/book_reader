const BookService = require('./service.js');
const { query, mutation } = require('./schema.js');

module.exports = (sql) => {
  const service = new BookService(sql);

  return {
    query: {
      type: query,
      resolve: () => service
    },
    mutation: {
      type: mutation,
      resolve: () => service
    }
  };
};
