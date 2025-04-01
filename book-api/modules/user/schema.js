const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLError,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const { messageCreator, convertDtoToZodObject, checkArrayHaveValues } = require('#utils');
const handleResolveResult = require('#utils/handle-resolve-result');
const UserDTO = require('#dto/user/user');
const OtpVerify = require('#dto/user/otp-verify');
const OtpUpdate = require('#dto/user/otp-update');
const PaginationResponse = require('#dto/common/pagination-response');

const {
  ResponseType,
  graphqlNotFoundErrorOption,
} = require('../common-schema');

const USER_INFORMATION_FIELDS = {
  email: {
    type: GraphQLString,
  },
  avatar: {
    type: GraphQLString,
  },
  mfaEnable: {
    type: GraphQLBoolean,
  },
};

const USER_INFORMATION_INPUT = new GraphQLInputObjectType({
  name: 'UserInformationInput',
  fields: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    ...USER_INFORMATION_FIELDS,
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: GraphQLString,
    },
  },
});

const USER_INFORMATION_UPDATE = new GraphQLObjectType({
  name: 'UserInformationUpdate',
  fields: {
    ...USER_INFORMATION_FIELDS,
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
  },
});

const USER_LOGIN_INFORMATION = new GraphQLObjectType({
  name: 'UserLoginInformation',
  fields: {
    ...USER_INFORMATION_FIELDS,
    name: {
      type: GraphQLString,
    },
    password: {
      type: GraphQLString,
    },
    apiKey: {
      type: GraphQLString,
    },
  },
});

const USER_INFORMATION = new GraphQLObjectType({
  name: 'UserInformation',
  fields: {
    userId: {
      type: GraphQLID,
    },
    ...USER_INFORMATION_FIELDS,
    name: {
      type: GraphQLString,
    },
  },
});

const query = new GraphQLObjectType({
  name: 'UserQuery',
  fields: {
    pagination: {
      type: new GraphQLObjectType({
        name: 'UserPagination',
        fields: {
          list: {
            type: new GraphQLList(USER_INFORMATION),
          },
          total: {
            type: GraphQLInt,
          },
        },
      }),
      args: {
        pageSize: {
          type: GraphQLInt,
        },
        pageNumber: {
          type: GraphQLInt,
        },
        keyword: {
          type: GraphQLString,
        },
      },
      resolve: async (user, { pageSize, pageNumber, keyword }, context) => {
        const [users, total] = await user.pagination(pageSize, pageNumber, keyword, context);

        if (!checkArrayHaveValues(users)) {
          throw new GraphQLError('User is empty!', graphqlNotFoundErrorOption);
        }

        return convertDtoToZodObject(PaginationResponse, {
          list: plainToInstance(UserDTO, users),
          total: parseInt(total || 0),
        });
      },
    },
    all: {
      type: new GraphQLList(new GraphQLNonNull(USER_INFORMATION)),
      resolve: async (user, args, context) => {
        const users = await user.getAllUsers(context);
        if (!checkArrayHaveValues(users)) {
          throw new GraphQLError('Users not found!', graphqlNotFoundErrorOption);
        }
        return convertDtoToZodObject(UserDTO, users);
      }
    },
    detail: {
      type: USER_INFORMATION_UPDATE,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (user, { userId }, context) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(UserDTO, await user.getUserDetail(userId, context));
        }, {
          RECORD_NOT_FOUND: 'User not found!'
        });
      },
    },
    login: {
      type: USER_LOGIN_INFORMATION,
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
        password: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (user, { email, password }, context) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(UserDTO, await user.login(email, password, context));
        }, {
          UNAUTHORIZED: 'User not found!'
        });
      },
    },
    verifyOtp: {
      type: new GraphQLObjectType({
        name: 'VerifyOtp',
        fields: {
          apiKey: {
            type: GraphQLString,
          },
        },
      }),
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
        otp: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (user, { email, otp }) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(OtpVerify, await user.verifyOtpCode(email, otp));
        }, {
          UNAUTHORIZED: 'Verify otp code failed!. Email or otp code not found!'
        });
      }
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'UserMutation',
  fields: {
    add: {
      type: ResponseType,
      args: {
        user: {
          type: new GraphQLNonNull(USER_INFORMATION_INPUT),
        },
      },
      resolve: async (user, args) => {
        await user.addUser(args.user);
        return messageCreator('Add user success!');
      },
    },
    updateMfaState: {
      type: ResponseType,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        mfaEnable: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
      },
      resolve: async (user, { userId, mfaEnable }) => {
        return handleResolveResult(async () => {
          const { email } = await user.updateMfaState(mfaEnable, userId);
          return messageCreator(`Update mfa state for email: ${email} success!`);
        }, {
          RECORD_NOT_FOUND: 'User not found!'
        });
      },
    },
    updateOtpCode: {
      type: new GraphQLObjectType({
        name: 'Otp',
        fields: {
          otp: {
            type: GraphQLString,
          },
          message: {
            type: GraphQLString,
          },
        },
      }),
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (user, { email }) => {
        return handleResolveResult(async () => {
          const otp = await user.updateOtpCode(email);
          return convertDtoToZodObject(OtpUpdate, { ...messageCreator('Otp code has sent to your email!'), otp });
        }, {
          RECORD_NOT_FOUND: 'User not found!'
        });
      },
    },
    update: {
      type: ResponseType,
      args: {
        user: {
          type: new GraphQLNonNull(USER_INFORMATION_INPUT),
        },
      },
      resolve: async (user, args) => {
        return handleResolveResult(async () => {
          await user.updateUser(args.user);
          return messageCreator('Update user success!');
        }, {
          RECORD_NOT_FOUND: 'User not found!'
        });
      },
    },
    delete: {
      type: ResponseType,
      args: {
        userId: {
          type: GraphQLID,
        },
      },
      resolve: async (user, { userId }) => {
        return handleResolveResult(async () => {
          const { email } = await user.deleteUser(userId);
          return messageCreator(`Delete user with email = ${email} success!`);
        }, {
          RECORD_NOT_FOUND: 'User not found!'
        });
      },
    },
  },
});

module.exports = {
  query,
  mutation,
};
