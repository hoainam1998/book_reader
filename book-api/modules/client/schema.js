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
const handleResolveResult = require('#utils/handleResolveResult');
const { ResponseType, graphqlUnauthorizedErrorOption } = require('../common-schema');
const { messageCreator } = require('#utils');

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
      resolve: async (service, { token, email, password }) => {
        return handleResolveResult(async () => {
          const client = await service.getClientDetail(email);
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
      type: ResponseType,
    }
  }
});

module.exports = {
  mutation,
  query,
};
