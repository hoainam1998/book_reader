const PrismaField = require('./prisma-field');

/**
* Class contain the fields valid to select.
* @class
* @extends PrismaField
*/
class ClientPrismaField extends PrismaField {
  _fields = {};
}

module.exports = ClientPrismaField;
