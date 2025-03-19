const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLError,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLFloat
} = require('graphql');
const { compare } = require('bcrypt');
const { plainToInstance } = require('class-transformer');
const handleResolveResult = require('#utils/handleResolveResult');
const ClientDTO = require('#dto/client/client.js');
const { ResponseType, graphqlUnauthorizedErrorOption } = require('../common-schema');
const { messageCreator } = require('#utils');

const CLIENT_DETAIL_TYPE = new GraphQLObjectType({
  name: 'ClientDetail',
  fields: {
    firstName: {
      type: GraphQLString
    },
    lastName: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    apiKey: {
      type: GraphQLString,
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'ClientMutation',
  fields: {
    signup: {
      type: ResponseType,
      args: {
        firstName: {
          type: new GraphQLNonNull(GraphQLString)
        },
        lastName: {
          type: new GraphQLNonNull(GraphQLString)
        },
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        password: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (service, { firstName, lastName, email, password }) => {
        return handleResolveResult(async () => {
          await service.signUp(firstName, lastName, email, password);
          return messageCreator('Reader signup success!');
        }, {
          UNIQUE_DUPLICATE: 'Email already exist!'
        });
      }
    },
    forgetPassword: {
      type: ResponseType,
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        passwordResetToken: {
          type: new GraphQLNonNull(GraphQLString)
        },
      },
      resolve: async (service, { email, passwordResetToken }) => {
        return handleResolveResult(async () => {
          await service.forgetPassword(email, passwordResetToken);
          return messageCreator('Reset password link already sent to your email!');
        }, {
          RECORD_NOT_FOUND: 'Email not found!'
        });
      }
    },
    resetPassword: {
      type: ResponseType,
      args: {
        token: {
          type: new GraphQLNonNull(GraphQLString)
        },
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        password: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (service, { token, email, password }, context) => {
        return handleResolveResult(async () => {
          const client = await service.getClientDetail(email, context);
          if (client.reset_password_token !== token) {
            throw new GraphQLError('Reset password token is valid!', graphqlUnauthorizedErrorOption);
          }
          return messageCreator('Reset password link already sent to your email!');
        }, {
          UNAUTHORIZED: 'User not found!'
        });
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'ClientQuery',
  fields: {
    login: {
      type: CLIENT_DETAIL_TYPE,
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
        password: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (service, { email, password }, context) => {
        return handleResolveResult(async () => {
          const select = { ...context, password: true };
          const client = await service.getClientDetail(email, select);
          if (await compare(password, client.password)) {;
            return plainToInstance(ClientDTO, client);
          }
          throw new GraphQLError('Password is incorrect!', graphqlUnauthorizedErrorOption);
        }, {
          UNAUTHORIZED: 'User not found!'
        });
      }
    }
  }
});

module.exports = {
  mutation,
  query,
};
