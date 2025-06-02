const PrismaField = require('./prisma-field');

/**
* Class contain the fields valid to select.
* @class
* @extends PrismaField
*/
class ClientPrismaField extends PrismaField {
  _fields = {
    clientId: 'reader_id',
    firstName: 'first_name',
    lastName: 'last_name',
    avatar: 'avatar',
    email: 'email',
  };
}

module.exports = ClientPrismaField;
