const PrismaField = require('./prisma-field');

/**
* Class contain the fields valid to select.
* @extends PrismaField
*/
class AuthorPrismaField extends PrismaField {
  _fields = {
    authorId: 'author_id',
    name: 'name',
    avatar: 'avatar',
    sex: 'sex',
    yearOfBirth: 'year_of_birth',
    yearOfDead: 'year_of_dead',
    storyFile: 'story',
  };
}

module.exports = AuthorPrismaField;
