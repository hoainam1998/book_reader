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
const ClientDTO = require('#dto/client/client');
const { ResponseType, graphqlUnauthorizedErrorOption } = require('../common-schema');
const { messageCreator, convertDtoToZodObject } = require('#utils');
const ForgetPassword = require('#dto/client/forget-password');
const handleResolveResult = require('#utils/handle-resolve-result');
const { READER } = require('#messages');

const CLIENT_DETAIL_TYPE = new GraphQLObjectType({
  name: 'ClientDetail',
  fields: {
    clientId: {
      type: GraphQLID
    },
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
    },
    passwordMustChange: {
      type: GraphQLBoolean,
    },
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
        oldPassword: {
          type: new GraphQLNonNull(GraphQLString)
        },
        password: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (service, { token, email, oldPassword, password }) => {
        return handleResolveResult(async () => {
          await service.resetPassword(token, email, oldPassword, password);
          return messageCreator(READER.RESET_PASSWORD_SUCCESS);
        }, {
          UNAUTHORIZED: READER.USER_NOT_FOUND,
        });
      }
    }
  }
});

const query = new GraphQLObjectType({
  name: 'ClientQuery',
  fields: {
    login: {
      type: new GraphQLNonNull(CLIENT_DETAIL_TYPE),
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
          return convertDtoToZodObject(ClientDTO, await service.login(email, password, context));
        }, {
          UNAUTHORIZED: READER.USER_NOT_FOUND,
        });
      }
    }
  }
});

module.exports = {
  mutation,
  query,
};
