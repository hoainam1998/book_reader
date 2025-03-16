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
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { graphqlErrorOption, graphqlNotFoundErrorOption, ResponseType } = require('../common-schema');
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
        await service.signUp(firstName, lastName, email, password);
        return messageCreator('Reader signup success!');
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
        passwordResetExpires: {
          type: new GraphQLNonNull(GraphQLFloat)
        }
      },
      resolve: async (service, { email, passwordResetToken, passwordResetExpires }) => {
        try {
          await service.forgetPassword(email, passwordResetToken, passwordResetExpires);
          return messageCreator('Reset password link already sent to your email!');
        } catch (err) {
          if (err instanceof PrismaClientKnownRequestError) {
            if (err.code === 'P2025') {
              throw new GraphQLError('Email not found!', graphqlNotFoundErrorOption);
            }
            throw new GraphQLError(err.meta.cause, graphqlErrorOption);
          }
          throw err;
        }
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'ClientQuery',
  fields: {
    detail: {
      type: ResponseType
    }
  }
});

module.exports = {
  mutation,
  query,
};
