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
const ClientDTO = require('#dto/client/client');
const { ResponseType, graphqlUnauthorizedErrorOption } = require('../common-schema');
const { messageCreator, convertDtoToZodObject } = require('#utils');
const ForgetPassword = require('#dto/client/forget-password');
const handleResolveResult = require('#utils/handle-resolve-result');
const { READER } = require('#messages');

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
          return messageCreator(READER.SIGNUP_SUCCESS);
        }, {
          UNIQUE_DUPLICATE: READER.EMAIL_EXIST,
        });
      }
    },
    forgetPassword: {
      type: new GraphQLObjectType({
        name: 'ForgetPasswordInputType',
        fields: {
          message: {
            type: new GraphQLNonNull(GraphQLString),
          },
          password: {
            type: new GraphQLNonNull(GraphQLString),
          },
          resetPasswordToken: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
      }),
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString)
        },
      },
      resolve: async (service, { email}) => {
        return handleResolveResult(async () => {
          const reader = await service.forgetPassword(email);
          return convertDtoToZodObject(
            ForgetPassword,
            Object.assign(reader, messageCreator(READER.SEND_RESET_PASSWORD_SUCCESS))
            );
        }, {
          RECORD_NOT_FOUND: READER.EMAIL_NOT_FOUND,
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
          await service.resetPassword(token, email, password);
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
          if (await compare(password, client.password)) {
            return convertDtoToZodObject(ClientDTO, client);
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
