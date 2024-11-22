const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLError, GraphQLInputObjectType } = require('graphql');
const { graphqlErrorOption, ResponseType } = require('../common-schema');
const { messageCreator } = require('#utils');

const query = new GraphQLObjectType({
  name: 'AuthorQuery',
  fields: {
    detail: {
      type: ResponseType,
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
          type: new GraphQLInputObjectType({
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
        }
      },
      resolve: async (service, { author }) => {
        try {
          await service.createAuthor(author);
          return messageCreator('Author create success!');
        } catch (error) {
          throw new GraphQLError(error.message, graphqlErrorOption);
        }
      }
    }
  }
});

module.exports = {
  query,
  mutation
};
