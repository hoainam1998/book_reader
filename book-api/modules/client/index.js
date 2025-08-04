const ClientService = require('./service');
const { query, mutation } = require('./schema');

module.exports = (prisma, redisClient) => {
  const service = new ClientService(prisma, redisClient);

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
