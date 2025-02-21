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
const PaginationResponse = require('#dto/common/pagination-response.js');
const AuthorDTO = require('#dto/author/author.js');
const AuthorDetailDTO = require('#dto/author/author-detail.js');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { graphqlErrorOption, graphqlNotFoundErrorOption, ResponseType } = require('../common-schema.js');
const { messageCreator } = require('#utils');

const COMMON_AUTHOR_FIELDS = {
  name: {
    type: GraphQLString
  },
  sex: {
    type: GraphQLInt,
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
          type: GraphQLID
        }
      },
      resolve: async (author, { authorId }, context) => {
        try {
          const authorDetail = await author.getAuthorDetail(authorId, context);
          if (!authorDetail) {
            throw new GraphQLError('Author not found!', graphqlNotFoundErrorOption);
          }
          return plainToInstance(AuthorDetailDTO, authorDetail);
        } catch (error) {
          if (error instanceof PrismaClientKnownRequestError) {
            throw new GraphQLError(error.meta.cause, graphqlErrorOption);
          }
          throw error;
        }
      }
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'AuthorPagination',
        fields: {
          list: {
            type: new GraphQLList(new GraphQLObjectType({
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
            }))
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
        const result = await author.pagination(pageSize, pageNumber, keyword, context);
        const authors = result[0];
        if (authors.length === 0) {
          const response = {
            list: [],
            total: 0
          };
          graphqlNotFoundErrorOption.extensions = { ...graphqlNotFoundErrorOption.extensions, response };
          throw new GraphQLError('Authors not found!', graphqlNotFoundErrorOption);
        }
        return plainToInstance(PaginationResponse, {
          list: plainToInstance(AuthorDTO, authors),
          total: parseInt(result[1] || 0)
        });
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
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'AuthorInformation',
            fields: {
              authorId: {
                type: GraphQLString
              },
              name: {
                type: GraphQLString
              },
              sex: {
                type: GraphQLInt
              },
              avatar: {
                type: GraphQLString
              },
              yearOfBirth: {
                type: GraphQLInt
              },
              yearOfDead: {
                type: GraphQLInt
              },
              story: {
                type: new GraphQLInputObjectType({
                  name: 'StoryInput',
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
          })),
        }
      },
      resolve: async (service, { author }) => {
        await service.createAuthor(author);
        return messageCreator('Author create success!');
      }
    }
  }
});

module.exports = {
  query,
  mutation
};
