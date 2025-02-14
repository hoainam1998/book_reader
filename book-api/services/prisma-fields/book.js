const PrismaField = require('./prisma-field');

/**
* Class contain the fields valid to select.
* @extends PrismaField
*/
class BookPrismaField extends PrismaField {
  _fields = {
    bookId: 'book_id',
    name: 'name',
    avatar: 'avatar',
    categoryId: 'category_id',
    pdf: 'pdf',
    publishedDay: 'published_day',
    publishedTime: 'published_time',
    introduce: 'introduce_file',
    category: {
      select: {
        name: true
      }
    },
    images: {
      as: 'book_image',
      child: ['image', 'name']
    },
  };
}

module.exports = BookPrismaField;
