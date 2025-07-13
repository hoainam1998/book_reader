const BookService = require('./service.js');
const { query, mutation } = require('./schema.js');

module.exports = (prisma) => {
  const service = new BookService(prisma);

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
