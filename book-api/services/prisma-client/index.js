const { PrismaClient } = require('@prisma/client');
const reader = require('./extensions/reader');

module.exports = new PrismaClient()
  .$extends({
    query: {
      reader
    }
  });
