const ClientService = require('./service');
const { query, mutation } = require('./schema');

module.exports = (prisma) => {
  const service = new ClientService(prisma);

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
