const PrismaField = require('./prisma-field');

/**
* Class contain the fields valid to select.
* @extends PrismaField
*/
class CategoryPrismaField extends PrismaField {
  _fields = {
    avatar: 'avatar',
    categoryId: 'category_id',
    name: 'name'
  };
}

module.exports = CategoryPrismaField;
