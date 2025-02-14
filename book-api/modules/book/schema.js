const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLObjectType,
  GraphQLError,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const { graphqlErrorOption, graphqlNotFoundErrorOption, ResponseType } = require('../common-schema.js');
const PaginationResponse = require('#dto/common/pagination-response.js');
const BookDTO = require('#dto/book/book.js');
const BookDetailDTO = require('#dto/book/book-detail.js');
const { messageCreator } = require('#utils');

const commonBookField = {
  name: {
    type: GraphQLString
  },
  publishedTime: {
    type: GraphQLInt
  },
  publishedDay: {
    type: GraphQLString
  },
  categoryId: {
    type: GraphQLString
  }
};

const BookType = new GraphQLObjectType({
  name: 'Book',
  fields: {
    bookId: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    pdf: {
      type: GraphQLString
    },
    publishedTime: {
      type: GraphQLInt
    },
    publishedDay: {
      type: GraphQLString
    },
    category: {
      type: GraphQLString
    },
    introduce: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    }
  }
});

const BookInformationInputType = new GraphQLInputObjectType({
  name: 'BookInformationInput',
  fields: {
    bookId: {
      type: GraphQLID
    },
    avatar: {
      type: GraphQLString
    },
    images: {
      type: new GraphQLList(new GraphQLInputObjectType({
        name: 'ImageInput',
        fields: {
          image: {
            type: GraphQLString
          },
          name: {
            type: GraphQLString
          },
          bookId: {
            type: GraphQLID
          }
        }
      })),
    },
    ...commonBookField,
  }
});

const BookInformationType = new GraphQLObjectType({
  name: 'BookInformation',
  fields: {
    ...commonBookField,
    pdf: {
      type: GraphQLString
    },
    images: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'BookImages',
        fields: {
          name: {
            type: GraphQLString
          },
          image: {
            type: GraphQLString
          }
        }
      }))
    },
    avatar: {
      type: GraphQLString
    },
    introduce: {
      type: new GraphQLObjectType({
        name: 'IntroduceFile',
        fields: {
          json: {
            type: GraphQLString
          },
          html: {
            type: GraphQLString
          }
        }
      })
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'BookMutation',
  fields: {
    saveIntroduce: {
      type: ResponseType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString)
        },
        html: {
          type: new GraphQLNonNull(GraphQLString)
        },
        json: {
          type: new GraphQLNonNull(GraphQLString)
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async (book, args) => {
        const { name, html, json, bookId } = args;
        await book.saveIntroduceHtmlFile(name, html, json, bookId);
        return messageCreator('Introduce file created!');
      }
    },
    updateIntroduce: {
      type: ResponseType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString)
        },
        html: {
          type: new GraphQLNonNull(GraphQLString)
        },
        json: {
          type: new GraphQLNonNull(GraphQLString)
        },
        bookId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async (book, args) => {
        const { name, html, json, bookId } = args;
        await book.deleteIntroduceFile(bookId);
        await book.saveIntroduceHtmlFile(name, html, json, bookId);
        return messageCreator('Introduce file created!');
      }
    },
    saveBookInfo: {
      type: ResponseType,
      args: {
        book: {
          type: new GraphQLNonNull(BookInformationInputType)
        }
      },
      resolve: async (book, args) => {
        await book.saveBookInfo(args.book);
        return messageCreator('Book has been created!');
      }
    },
    updateBookInfo: {
      type: ResponseType,
      args: {
        book: {
          type: new GraphQLNonNull(BookInformationInputType)
        }
      },
      resolve: async (book, args) => {
        await book.updateBookInfo(args.book);
        return messageCreator('Book has been updated!');
      }
    },
    savePdfFile: {
      type: ResponseType,
      args: {
        bookId: {
          type: new GraphQLNonNull(GraphQLID)
        },
        pdf: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (book, { bookId, pdf }) => {
        await book.savePdfFile(bookId, pdf);
        return messageCreator('Save pdf file success!');
      }
    },
    updatePdfFile: {
      type: ResponseType,
      args: {
        bookId: {
          type: new GraphQLNonNull(GraphQLID)
        },
        pdf: {
          type: new GraphQLNonNull(GraphQLString)
        },
        name: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (book, { bookId, pdf, name }) => {
        await book.deletePdfFile(bookId, name);
        await book.savePdfFile(bookId, pdf);
        return messageCreator('Update pdf file success!');
      }
    },
    updateBookImages: {
      type: ResponseType,
      args: {
        images: {
          type: new GraphQLList(GraphQLString)
        },
        name: {
          type: new GraphQLList(GraphQLString)
        },
        bookId: {
          type: GraphQLID
        }
      },
      resolve: async (book, { images, bookId, name }) => {
        try {
          await book.deleteImages(bookId);
          await book.saveBookImages(images, bookId, name);
          return messageCreator('Book images has been updated!');
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'BookQuery',
  fields: {
    all: {
      type: GraphQLString,
      resolve: () => {}
    },
    detail: {
      type: BookInformationType,
      args: {
        bookId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async (book, { bookId }, context) => {
        const bookInfo = await book.getBookDetail(bookId, context);
        if (bookInfo) {
          return plainToInstance(BookDetailDTO, bookInfo);
        } else {
          throw new GraphQLError(`Can not found book with id is ${bookId}!`, graphqlNotFoundErrorOption);
        }
      }
    },
    names: {
      type: new GraphQLList(GraphQLString),
      resolve: async (book) => {
        const names = await book.getAllName();
        return plainToInstance(String, names.map(({ name }) => name));
      }
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'BookPagination',
        fields: {
          list: {
            type: new GraphQLList(BookType)
          },
          total: {
            type: GraphQLInt
          }
        }
      }),
      args: {
        pageNumber: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        pageSize: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        keyword: {
          type: GraphQLString
        }
      },
      resolve: async (book, { pageNumber, pageSize, keyword }, context) => {
        const result = await book.pagination(pageSize, pageNumber, keyword, context);
        const books = result[0];
        if (books.length === 0) {
          const response = {
            list: [],
            total: 0
          };
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response };
          throw new GraphQLError('Books not found!', graphqlNotFoundErrorOption);
        }
        return plainToInstance(PaginationResponse, {
          list: plainToInstance(BookDTO, books.map(book => ({ ...book, category: book.category.name }))),
          total: parseInt(result[1] || 0)
        });
      }
    }
  }
});

export {
  mutation,
  query
};
