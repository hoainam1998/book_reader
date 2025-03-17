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
const handleResolveResult = require('#utils/handleResolveResult');
const { ResponseType } = require('../common-schema');
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
        passwordResetExpires: {
          type: new GraphQLNonNull(GraphQLFloat)
        }
      },
      resolve: async (service, { email, passwordResetToken, passwordResetExpires }) => {
        return handleResolveResult(async () => {
          await service.forgetPassword(email, passwordResetToken, passwordResetExpires);
          return messageCreator('Reset password link already sent to your email!');
        }, {
          RECORD_NOT_FOUND: 'Email not found!'
        });
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
