const { PrismaClient, Prisma } = require('@prisma/client');
const reader = require('./extensions/reader');
const user = require('./extensions/user');

const extensions = Prisma.defineExtension((prisma) => {
  return prisma.$extends({
    query: {
      reader: reader(prisma),
      user: user(prisma),
    },
  });
});

module.exports = new PrismaClient().$extends(extensions);
