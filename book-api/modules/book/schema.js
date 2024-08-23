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
const { messageCreator } = require('../../utils/index.js');

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

const BookIntroduceInputType = new GraphQLInputObjectType({
  name: 'BookIntroduceInput',
  fields: {
    name: {
      type: GraphQLString
    },
    html: {
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
    introduce: {
      type: GraphQLString
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'BookMutation',
  fields: {
    saveIntroduce: {
      type: ResponseType,
      args: {
        introduce: {
          type: BookIntroduceInputType
        }
      },
      resolve: async (book, args) => {
        const { name, html } = args.introduce;
        try {
          const isSaved = await book.saveIntroduceHtmlFile(name, html);
          if (isSaved) {
            return messageCreator('Html file created!');
          }
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
            return {
              ...bookInfo[0],
              images: images.map(({ image, name }) => ({ image, name }))
            };
          } else {
            throw new GraphQLError(`Can not found book with id is ${bookId}`, graphqlNotFoundErrorOption);
          }
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
