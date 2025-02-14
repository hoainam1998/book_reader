const PrismaField = require('./prisma-field');

/**
* Class contain the fields valid to select.
* @extends PrismaField
*/
class UserPrismaField extends PrismaField {
  _fields = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    avatar: 'avatar',
    mfaEnable: 'mfa_enable',
    userId: 'user_id',
    password: 'password',
    name: ['first_name', 'last_name']
  };
}

module.exports = UserPrismaField;

