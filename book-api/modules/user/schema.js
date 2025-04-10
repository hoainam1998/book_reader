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
const { USER } = require('#messages');
const handleResolveResult = require('#utils/handle-resolve-result');
const UserDTO = require('#dto/user/user');
const OtpVerify = require('#dto/user/otp-verify');
const OtpUpdate = require('#dto/user/otp-update');
const UserCreated = require('#dto/user/user-created');
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
  sex: {
    type: GraphQLInt,
  },
  mfaEnable: {
    type: GraphQLBoolean,
  },
};

const USER_INFORMATION_INPUT = new GraphQLInputObjectType({
  name: 'UserInformationInput',
  fields: {
    userId: {
      type: GraphQLID,
    },
    ...USER_INFORMATION_FIELDS,
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
    },
    power: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
});

const USER_INFORMATION_DETAIL = new GraphQLObjectType({
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
          throw new GraphQLError(USER.USERS_EMPTY, graphqlNotFoundErrorOption);
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
          throw new GraphQLError(USER.USER_NOT_FOUND, graphqlNotFoundErrorOption);
        }
        return convertDtoToZodObject(UserDTO, users);
      }
    },
    detail: {
      type: USER_INFORMATION_DETAIL,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (user, { userId }, context) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(UserDTO, await user.getUserDetail(userId, context));
        }, {
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND
        });
      },
    },
    login: {
      type: new GraphQLObjectType({
        name: 'UserLoginInformation',
        fields: {
          ...USER_INFORMATION_FIELDS,
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
          apiKey: {
            type: new GraphQLNonNull(GraphQLString),
          },
          power: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          passwordMustChange: {
            type: new GraphQLNonNull(GraphQLBoolean),
          },
          resetPasswordToken: {
            type: GraphQLString,
          },
        },
      }),
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
          UNAUTHORIZED: USER.USER_NOT_FOUND
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
          UNAUTHORIZED: USER.VERIFY_OTP_FAIL_DUE_MISSING_OTP_OR_EMAIL
        });
      }
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'UserMutation',
  fields: {
    add: {
      type: new GraphQLObjectType({
        name: 'UserCreated',
        fields: {
          password: {
            type: new GraphQLNonNull(GraphQLString),
          },
          resetPasswordToken: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
      }),
      args: {
        user: {
          type: new GraphQLNonNull(USER_INFORMATION_INPUT),
        },
      },
      resolve: async (user, args) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(UserCreated, await user.addUser(args.user));
        }, {
          UNIQUE_DUPLICATE: USER.EMAIL_EXIST
        });
      },
    },
    resetPassword: {
      type: ResponseType,
      args: {
        resetPasswordToken: {
          type: new GraphQLNonNull(GraphQLString),
        },
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
        oldPassword: {
          type: new GraphQLNonNull(GraphQLString),
        },
        password: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (user, { resetPasswordToken, email, oldPassword, password }) => {
        return handleResolveResult(async () => {
          await user.resetPassword(resetPasswordToken, email, oldPassword, password);
          return messageCreator(USER.RESET_PASSWORD_SUCCESS);
        }, {
          UNAUTHORIZED: USER.USER_NOT_FOUND
        });
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
          return messageCreator(USER.UPDATE_MFA_STATE_SUCCESS.format(email));
        }, {
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND
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
          return convertDtoToZodObject(OtpUpdate, { ...messageCreator(USER.OTP_HAS_BEEN_SENT), otp });
        }, {
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND
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
          return messageCreator(USER.UPDATE_USER_SUCCESS);
        }, {
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND
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
          return messageCreator(USER.DELETE_USER_SUCCESS.format(email));
        }, {
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND
        });
      },
    },
  },
});

module.exports = {
  query,
  mutation,
};
