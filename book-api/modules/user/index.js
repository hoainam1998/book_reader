const { query, mutation } = require('./schema');
const UserService = require('./service');

module.exports = (prisma, redisClient) => {
  const service = new UserService(prisma, redisClient);

  return {
    query: {
      resolve: () => service,
      type: query,
    },
    mutation: {
      resolve: () => service,
      type: mutation,
    },
  };
};
