const PrismaField = require('./prisma-field');

class ClientPrismaField extends PrismaField {
  _fields = {};
}

module.exports = ClientPrismaField;
