const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLObjectType,
  GraphQLError,
  GraphQLInt,
  GraphQLID,
  GraphQLList
} = require('graphql');
const { graphqlErrorOption, graphqlNotFoundErrorOption, ResponseType } = require('../common-schema.js');
const { messageCreator } = require('#utils');

const commonBookField = {
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
    ...commonBookField,
  }
});

const BookInformationType = new GraphQLObjectType({
  name: 'BookInformation',
  fields: {
    ...commonBookField,
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
          type: GraphQLString
        },
        html: {
          type: GraphQLString
        },
        json: {
          type: GraphQLString
        },
        bookId: {
          type: GraphQLID
        }
      },
      resolve: async (book, args) => {
        const { name, html, json, bookId } = args;
        try {
          await book.deleteIntroduceFile(bookId);
          await book.saveIntroduceHtmlFile(name, html, json, bookId);
          return messageCreator('Html file created!');
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    saveBookInfo: {
      type: ResponseType,
      args: {
        book: {
          type: BookInformationInputType
        }
      },
      resolve: async (book, args) => {
        try {
          await book.saveBookInfo(args.book);
          return messageCreator('Book has been created!');
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    saveBookAvatar: {
      type: ResponseType,
      args: {
        avatar: {
          type: GraphQLString
        },
        bookId: {
          type: GraphQLID
        }
      },
      resolve: async (book, { avatar, bookId }) => {
        try {
          await book.saveBookAvatar(avatar, bookId);
          return messageCreator('Avatar book has been inserted!');
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    saveBookImages: {
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
          await book.saveBookImages(images, bookId, name);
          return messageCreator('Book images has been created!');
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    updateBookInfo: {
      type: ResponseType,
      args: {
        book: {
          type: BookInformationInputType
        }
      },
      resolve: async (book, args) => {
        try {
          await book.deletePdfFile(args.book.bookId);
          const result = await book.updateBookInfo(args.book);
          if (result.affectedRows === 0) {
            throw new GraphQLError(`Book with id = ${args.book.bookId} not found`, graphqlNotFoundErrorOption);
          }
          return messageCreator('Update book success!');
        } catch (err) {
          if (err instanceof GraphQLError) {
            throw err;
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
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
          type: GraphQLID
        }
      },
      resolve: async (book, { bookId }) => {
        try {
          const [bookInfo, images] = await book.getBookDetail(bookId);
          if (bookInfo.length > 0) {
            const bookDetail = bookInfo[0];
            const [html, json] = bookDetail['introduce'] ? bookDetail['introduce'].split(',') : [];
            return {
              ...bookDetail,
              introduce: {
                html: html ? html.trim() : '',
                json: json ? json.trim(): '',
              },
              images: images.map(({ image, name }) => ({ image, name }))
            };
          } else {
            throw new GraphQLError(`Can not found book with id is ${bookId}!`, graphqlNotFoundErrorOption);
          }
        } catch (err) {
          if (err instanceof GraphQLError) {
            throw err;
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    allName: {
      type: new GraphQLList(GraphQLString),
      resolve: async (book) => {
        try {
          const names = await book.getAllName();
          return names.map(({ name }) => name);
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
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
          type: GraphQLInt
        },
        pageSize: {
          type: GraphQLInt
        },
        keyword: {
          type: GraphQLString
        }
      },
      resolve: async (book, { pageNumber, pageSize, keyword }) => {
        try {
          const result = await book.pagination(pageSize, pageNumber, keyword);
          const books = result[0];
          if (books.length === 0) {
            const response = {
              list: [],
              total: 0
            };
            graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response };
            throw new GraphQLError('Books not found!', graphqlNotFoundErrorOption);
          }
          return {
            list: books.map((book) => ({ ...book, introduce: book.introduce?.split(',')[0] || '' })),
            total: parseInt(result[1][0].total || 0)
          };
        } catch (err) {
          if (err instanceof GraphQLError) {
            throw err;
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

export {
  mutation,
  query
};
