const { query, mutation } = require('./schema.js');
const CategoryService = require('./service.js');

module.exports = (prisma, redisClient) => {
  const service = new CategoryService(prisma, redisClient);

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
