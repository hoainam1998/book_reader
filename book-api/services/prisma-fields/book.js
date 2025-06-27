const PrismaField = require('./prisma-field');

/**
* Class contain the fields valid to select.
* @class
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
        name: true,
        category_id: true,
        avatar: true,
      }
    },
    images: {
      as: 'book_image',
      child: ['image', 'name']
    },
    authors: {
      as: 'book_author',
      select: {
        author: {
          select: {
            author_id: true,
            avatar: true,
            name: true,
          }
        }
      }
    },
  };
}

module.exports = BookPrismaField;
