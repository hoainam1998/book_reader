const AuthorService = require('./service');
const { query, mutation } = require('./schema');

module.exports = (prisma, redisClient) => {
  const service = new AuthorService(prisma, redisClient);
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
