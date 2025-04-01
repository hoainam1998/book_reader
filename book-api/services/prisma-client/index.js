const { PrismaClient, Prisma } = require('@prisma/client');
const reader = require('./extensions/reader');

const extensions = Prisma.defineExtension((prisma) => {
  return prisma.$extends({
    query: {
      reader: reader(prisma)
    }
  });
});

module.exports = new PrismaClient().$extends(extensions);
