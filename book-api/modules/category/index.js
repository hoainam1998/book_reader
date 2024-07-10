const { query, mutation } = require('./schema.js');
const CategoryService = require('./service.js');

module.exports = (querySql) => {
  const service = new CategoryService(querySql);

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
