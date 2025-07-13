const { query, mutation } = require('./schema.js');
const CategoryService = require('./service.js');

module.exports = (prisma) => {
  const service = new CategoryService(prisma);

  return {
    query: {
      type: query,
      resolve: () => service,
    },
    mutation: {
      type: mutation,
      resolve: () => service,
    },
  };
};
