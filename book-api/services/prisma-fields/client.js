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
    sex: 'sex',
    phone: 'phone',
    name: ['first_name', 'last_name'],
    resetPasswordToken: 'reset_password_token',
    favoriteBooks: {
      as: 'favorite_books',
      select: {
        book: {
          select: {
            book_id: true,
            name: true,
            avatar: true,
            book_author: {
              select: {
                author: {
                  select: {
                    name: true,
                    author_id: true,
                  }
                }
              }
            }
          }
        }
      }
    },
    readLate: {
      as: 'read_late',
      select: {
        book: {
          select: {
            book_id: true,
            name: true,
            avatar: true,
            book_author: {
              select: {
                author: {
                  select: {
                    name: true,
                    author_id: true,
                  }
                }
              }
            }
          }
        },
        added_at: true,
      }
    },
    usedRead: {
      as: 'used_read',
      select: {
        book: {
          select: {
            book_id: true,
            name: true,
            avatar: true,
            book_author: {
              select: {
                author: {
                  select: {
                    name: true,
                    author_id: true,
                  }
                }
              }
            }
          }
        },
        added_at: true,
      }
    }
  };
}

module.exports = ClientPrismaField;
