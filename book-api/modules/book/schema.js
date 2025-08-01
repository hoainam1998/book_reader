const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const { ResponseType } = require('../common-schema.js');
const PaginationResponse = require('#dto/common/pagination-response');
const BookDTO = require('#dto/book/book');
const BookDetailDTO = require('#dto/book/book-detail');
const { BOOK } = require('#messages');
const { messageCreator, convertDtoToZodObject } = require('#utils');
const handleResolveResult = require('#utils/handle-resolve-result');

const COMMON_BOOK_FIELD = {
  name: {
    type: GraphQLString,
  },
  publishedTime: {
    type: GraphQLInt,
  },
  publishedDay: {
    type: GraphQLString,
  },
  categoryId: {
    type: GraphQLString,
  },
};

const AUTHORS = new GraphQLObjectType({
  name: 'Authors',
  fields: {
    authorId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

const CATEGORY = new GraphQLObjectType({
  name: 'CategoryDetail',
  fields: {
    categoryId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

const BOOK_TYPE = new GraphQLObjectType({
  name: 'Book',
  fields: {
    bookId: {
      type: GraphQLID,
    },
    pdf: {
      type: GraphQLString,
    },
    category: {
      type: new GraphQLNonNull(CATEGORY),
    },
    introduce: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    authors: {
      type: new GraphQLNonNull(new GraphQLList(AUTHORS)),
    },
    ...COMMON_BOOK_FIELD,
  },
});

const BOOK_INFORMATION_INPUT_TYPE = new GraphQLInputObjectType({
  name: 'BookInformationInput',
  fields: {
    bookId: {
      type: GraphQLID,
    },
    avatar: {
      type: GraphQLString,
    },
    images: {
      type: new GraphQLList(
        new GraphQLInputObjectType({
          name: 'ImageInput',
          fields: {
            image: {
              type: GraphQLString,
            },
            name: {
              type: GraphQLString,
            },
          },
        })
      ),
    },
    ...COMMON_BOOK_FIELD,
  },
});

const BOOK_INFORMATION_TYPE = new GraphQLObjectType({
  name: 'BookInformation',
  fields: {
    ...COMMON_BOOK_FIELD,
    pdf: {
      type: GraphQLString,
    },
    images: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: 'BookImages',
          fields: {
            name: {
              type: GraphQLString,
            },
            image: {
              type: GraphQLString,
            },
          },
        })
      ),
    },
    avatar: {
      type: GraphQLString,
    },
    introduce: {
      type: new GraphQLObjectType({
        name: 'IntroduceFile',
        fields: {
          json: {
            type: GraphQLString,
          },
          html: {
            type: GraphQLString,
          },
        },
      }),
    },
    authors: {
      type: new GraphQLNonNull(new GraphQLList(AUTHORS)),
    },
    category: {
      type: new GraphQLNonNull(CATEGORY),
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'BookMutation',
  fields: {
    saveIntroduce: {
      type: ResponseType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        html: {
          type: new GraphQLNonNull(GraphQLString),
        },
        json: {
          type: new GraphQLNonNull(GraphQLString),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (book, { name, html, json, bookId }) => {
        return handleResolveResult(
          async () => {
            await book.saveIntroduceHtmlFile(name, html, json, bookId);
            return messageCreator(BOOK.INTRODUCE_FILE_SAVE);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
          }
        );
      },
    },
    updateIntroduce: {
      type: ResponseType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        html: {
          type: new GraphQLNonNull(GraphQLString),
        },
        json: {
          type: new GraphQLNonNull(GraphQLString),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (book, { name, html, json, bookId }) => {
        return handleResolveResult(
          async () => {
            await book.deleteIntroduceFile(bookId);
            await book.saveIntroduceHtmlFile(name, html, json, bookId);
            return messageCreator(BOOK.INTRODUCE_FILE_SAVE);
          },
          {
            RECORD_NOT_FOUND: BOOK.INTRODUCE_FILE_NOT_FOUND,
          }
        );
      },
    },
    saveBookInfo: {
      type: ResponseType,
      args: {
        book: {
          type: new GraphQLNonNull(BOOK_INFORMATION_INPUT_TYPE),
        },
      },
      resolve: async (book, args) => {
        await book.saveBookInfo(args.book);
        return messageCreator(BOOK.BOOK_CREATED);
      },
    },
    updateBookInfo: {
      type: ResponseType,
      args: {
        book: {
          type: new GraphQLNonNull(BOOK_INFORMATION_INPUT_TYPE),
        },
      },
      resolve: async (book, args) => {
        return handleResolveResult(
          async () => {
            await book.updateBookInfo(args.book);
            return messageCreator(BOOK.BOOK_UPDATED);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
          }
        );
      },
    },
    savePdfFile: {
      type: ResponseType,
      args: {
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        pdf: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (book, { bookId, pdf }) => {
        return handleResolveResult(
          async () => {
            await book.savePdfFile(bookId, pdf);
            return messageCreator(BOOK.PDF_SAVED);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
          }
        );
      },
    },
    updatePdfFile: {
      type: ResponseType,
      args: {
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        pdf: {
          type: new GraphQLNonNull(GraphQLString),
        },
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (book, { bookId, pdf, name }) => {
        return handleResolveResult(
          async () => {
            await book.deletePdfFile(bookId, name);
            await book.savePdfFile(bookId, pdf);
            return messageCreator(BOOK.PDF_UPDATED);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
          }
        );
      },
    },
    saveBookAuthor: {
      type: ResponseType,
      args: {
        authors: {
          type: new GraphQLNonNull(
            new GraphQLList(
              new GraphQLNonNull(
                new GraphQLInputObjectType({
                  name: 'BookAuthor',
                  fields: {
                    bookId: {
                      type: GraphQLID,
                    },
                    authorId: {
                      type: GraphQLID,
                    },
                  },
                })
              )
            )
          ),
        },
      },
      resolve: async (book, { authors }) => {
        const authorList = authors.map((author) => ({ author_id: author.authorId, book_id: author.bookId }));

        await book.deleteBookAuthor(authorList[0].book_id);
        await book.saveBookAuthor(authorList);
        return messageCreator(BOOK.CREATE_BOOK_AUTHOR_SUCCESS);
      },
    },
    addFavoriteBook: {
      type: ResponseType,
      args: {
        readerId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { readerId, bookId }) => {
        return handleResolveResult(
          async () => {
            await service.addFavoriteBook(readerId, bookId);
            return messageCreator(BOOK.ADD_FAVORITE_BOOK_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
            FOREIGN_KEY_CONFLICT: BOOK.BOOK_DO_NOT_EXIST,
            UNIQUE_DUPLICATE: BOOK.ADD_FAVORITE_BOOK_DUPLICATE,
          }
        );
      },
    },
    deleteFavoriteBook: {
      type: ResponseType,
      args: {
        readerId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { readerId, bookId }) => {
        return handleResolveResult(
          async () => {
            await service.deleteFavoriteBook(readerId, bookId);
            return messageCreator(BOOK.DELETE_FAVORITE_BOOK_SUCCESS);
          },
          {
            FOREIGN_KEY_CONFLICT: BOOK.BOOK_DO_NOT_EXIST,
          }
        );
      },
    },
    addReadLateBook: {
      type: ResponseType,
      args: {
        readerId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        createAt: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { readerId, bookId, createAt }) => {
        return handleResolveResult(
          async () => {
            await service.addReadLateBook(readerId, bookId, createAt);
            return messageCreator(BOOK.ADD_READ_LATE_BOOK_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
            FOREIGN_KEY_CONFLICT: BOOK.BOOK_DO_NOT_EXIST,
            UNIQUE_DUPLICATE: BOOK.ADD_READ_LATE_BOOK_DUPLICATE,
          }
        );
      },
    },
    deleteReadLateBook: {
      type: ResponseType,
      args: {
        readerId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { readerId, bookId }) => {
        return handleResolveResult(
          async () => {
            await service.deleteReadLateBook(readerId, bookId);
            return messageCreator(BOOK.DELETE_READ_LATE_BOOK_SUCCESS);
          },
          {
            FOREIGN_KEY_CONFLICT: BOOK.BOOK_DO_NOT_EXIST,
          }
        );
      },
    },
    addUsedReadBook: {
      type: ResponseType,
      args: {
        readerId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        createAt: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { readerId, bookId, createAt }) => {
        return handleResolveResult(
          async () => {
            await service.addUsedReadBook(readerId, bookId, createAt);
            return messageCreator(BOOK.ADD_USED_BOOK_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
            FOREIGN_KEY_CONFLICT: BOOK.BOOK_DO_NOT_EXIST,
            UNIQUE_DUPLICATE: BOOK.ADD_USED_READ_DUPLICATE,
          }
        );
      },
    },
    deleteUsedReadBook: {
      type: ResponseType,
      args: {
        readerId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { readerId, bookId }) => {
        return handleResolveResult(
          async () => {
            await service.deleteUsedReadBook(readerId, bookId);
            return messageCreator(BOOK.DELETE_USED_READ_BOOK_SUCCESS);
          },
          {
            FOREIGN_KEY_CONFLICT: BOOK.BOOK_DO_NOT_EXIST,
          }
        );
      },
    },
    deleteBook: {
      type: ResponseType,
      args: {
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { bookId }) => {
        return handleResolveResult(
          async () => {
            await service.deleteBook(bookId);
            return messageCreator(BOOK.DELETE_BOOK_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
          }
        );
      },
    },
  },
});

const query = new GraphQLObjectType({
  name: 'BookQuery',
  fields: {
    all: {
      type: new GraphQLNonNull(new GraphQLList(BOOK_TYPE)),
      resolve: async (book, args, context) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(BookDTO, await book.getAllBooks(context));
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
          }
        );
      },
    },
    detail: {
      type: BOOK_INFORMATION_TYPE,
      args: {
        bookId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (book, { bookId }, context) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(BookDetailDTO, await book.getBookDetail(bookId, context));
          },
          {
            RECORD_NOT_FOUND: BOOK.BOOK_NOT_FOUND,
          }
        );
      },
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'BookPagination',
        fields: {
          list: {
            type: new GraphQLNonNull(new GraphQLList(BOOK_TYPE)),
          },
          total: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          page: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          pages: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          pageSize: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        },
      }),
      args: {
        pageNumber: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        pageSize: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        keyword: {
          type: GraphQLString,
        },
        by: {
          type: new GraphQLInputObjectType({
            name: 'ByCondition',
            fields: {
              authorId: {
                type: GraphQLString,
              },
              categoryId: {
                type: GraphQLString,
              },
            },
          }),
        },
      },
      resolve: async (book, { pageNumber, pageSize, keyword, by }, context) => {
        const [books, total, pages] = await book.pagination(pageSize, pageNumber, keyword, by, context);
        return convertDtoToZodObject(PaginationResponse, {
          list: plainToInstance(BookDTO, books),
          total: parseInt(total || 0),
          page: pageNumber,
          pages,
          pageSize,
        });
      },
    },
  },
});

export { mutation, query };
