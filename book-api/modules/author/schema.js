const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLError
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const PaginationResponse = require('#dto/common/pagination-response');
const AuthorDTO = require('#dto/author/author');
const AuthorDetailDTO = require('#dto/author/author-detail');
const { AUTHOR } = require('#messages');
const { graphqlNotFoundErrorOption, ResponseType } = require('../common-schema.js');
const { messageCreator, convertDtoToZodObject, checkArrayHaveValues } = require('#utils');
const handleResolveResult = require('#utils/handle-resolve-result');

const COMMON_AUTHOR_FIELDS = {
  name: {
    type: GraphQLString
  },
  sex: {
    type: GraphQLInt
  },
  avatar: {
    type: GraphQLString,
  },
  yearOfBirth: {
    type: GraphQLInt,
  },
  yearOfDead: {
    type: GraphQLInt,
  },
};

const AUTHOR_INPUT_TYPE = new GraphQLNonNull(new GraphQLInputObjectType({
  name: 'AuthorInformation',
  fields: {
    authorId: {
      type: GraphQLID
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    sex: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString)
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    yearOfDead: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    story: {
      type: new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'StoryInput',
        fields: {
          html: {
            type: GraphQLString
          },
          json: {
            type: GraphQLString
          }
        }
      })),
    }
  }
}));

const AUTHOR_LIST = new GraphQLList(new GraphQLObjectType({
  name: 'AuthorPaginationList',
  fields: {
    authorId: {
      type: GraphQLID
    },
    ...COMMON_AUTHOR_FIELDS,
    storyFile: {
      type: GraphQLString,
    }
  }
}));

const query = new GraphQLObjectType({
  name: 'AuthorQuery',
  fields: {
    detail: {
      type: new GraphQLObjectType({
        name: 'AuthorDetail',
        fields: {
          ...COMMON_AUTHOR_FIELDS,
          storyFile: {
            type: new GraphQLObjectType({
              name: 'Story',
              fields: {
                html: {
                  type: GraphQLString
                },
                json: {
                  type: GraphQLString
                }
              }
            })
          }
        }
      }),
      args: {
        authorId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async (author, { authorId }, context) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(AuthorDetailDTO, await author.getAuthorDetail(authorId, context));
        }, {
          RECORD_NOT_FOUND: AUTHOR.AUTHOR_NOT_FOUND,
        });
      }
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'AuthorPagination',
        fields: {
          list: {
            type: AUTHOR_LIST
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
      resolve: async (author, { pageSize, pageNumber, keyword }, context) => {
        const [authors, total] = await author.pagination(pageSize, pageNumber, keyword, context);
        if (!checkArrayHaveValues(authors)) {
          const response = {
            list: [],
            total: 0
          };
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response };
          throw new GraphQLError('Authors not found!', graphqlNotFoundErrorOption);
        }
        return convertDtoToZodObject(PaginationResponse, {
          list: plainToInstance(AuthorDTO, authors),
          total: parseInt(total || 0)
        });
      }
    },
    filter: {
      type: AUTHOR_LIST,
      args: {
        authorIds: {
          type: new GraphQLList(GraphQLString)
        }
      },
      resolve: async (author, { authorIds }, context) => {
        const authors = await author.getAuthors(authorIds, context);
        if (!checkArrayHaveValues(authors)) {
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response: [] };
          throw new GraphQLError('Authors not found!', graphqlNotFoundErrorOption);
        }
        return convertDtoToZodObject(AuthorDTO, authors);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'AuthorMutation',
  fields: {
    create: {
      type: ResponseType,
      args: {
        author: {
          type: AUTHOR_INPUT_TYPE
        }
      },
      resolve: async (service, { author }) => {
        await service.createAuthor(author);
        return messageCreator(AUTHOR.CREATE_AUTHOR_SUCCESS);
      }
    },
    update: {
      type: ResponseType,
      args: {
        author: {
          type: AUTHOR_INPUT_TYPE
        }
      },
      resolve: async (service, { author }) => {
        return handleResolveResult(async () => {
          await service.deleteStoryFile(author.authorId);
          await service.updateAuthor(author);
          return messageCreator(AUTHOR.UPDATE_AUTHOR_SUCCESS);
        }, {
          RECORD_NOT_FOUND: AUTHOR.AUTHOR_NOT_FOUND,
        });
      }
    },
  }
});

module.exports = {
  query,
  mutation
};
