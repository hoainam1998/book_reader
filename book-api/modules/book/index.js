const BookService = require('./service.js');
const { query, mutation } = require('./schema.js');

module.exports = (prisma, redisClient) => {
  const service = new BookService(prisma, redisClient);

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
