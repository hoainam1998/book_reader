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
const ErrorCode = require('#services/error-code');
const UserDTO = require('#dto/user/user');
const OtpVerify = require('#dto/user/otp-verify');
const OtpUpdate = require('#dto/user/otp-update');
const UserCreated = require('#dto/user/user-created');
const ForgetPassword = require('#dto/user/forget-password');
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
  phone: {
    type: GraphQLString,
  },
};

const REQUIREMENT_USER_INFORMATION_INPUT = {
  firstName: {
    type: new GraphQLNonNull(GraphQLString),
  },
  lastName: {
    type: new GraphQLNonNull(GraphQLString),
  },
  sex: {
    type: new GraphQLNonNull(GraphQLInt),
  },
  email: {
    type: new GraphQLNonNull(GraphQLString),
  },
  phone: {
    type: new GraphQLNonNull(GraphQLString),
  },
};

const USER_INFORMATION_INPUT = new GraphQLInputObjectType({
  name: 'UserInformationInput',
  fields: {
    ...REQUIREMENT_USER_INFORMATION_INPUT,
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    power: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    mfaEnable: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});

const USER_INFORMATION_CREATE_INPUT = new GraphQLInputObjectType({
  name: 'UserInformationCreateInput',
  fields: {
    ...REQUIREMENT_USER_INFORMATION_INPUT,
    power: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    mfaEnable: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});

const USER_INFORMATION_UPDATE_PERSON_INPUT = new GraphQLInputObjectType({
  name: 'UserInformationUpdatePersonInput',
  fields: {
    ...REQUIREMENT_USER_INFORMATION_INPUT,
    userId: {
      type: new GraphQLNonNull(GraphQLID),
    },
    avatar: {
      type: new GraphQLNonNull(GraphQLString),
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
    power: {
      type: GraphQLBoolean,
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
    role: {
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
      args: {
        exceptedUserId: {
          type: GraphQLID,
        },
      },
      resolve: async (user, { exceptedUserId }, context) => {
        const users = await user.getAllUsers(exceptedUserId, context);
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
          userId: {
            type: new GraphQLNonNull(GraphQLID),
          },
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
          apiKey: {
            type: GraphQLString,
          },
          role: {
            type: new GraphQLNonNull(GraphQLString),
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
          type: new GraphQLNonNull(USER_INFORMATION_CREATE_INPUT),
        },
      },
      resolve: async (user, args) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(UserCreated, await user.addUser(args.user));
        }, {
          UNIQUE_DUPLICATE: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
        });
      },
    },
    forgetPassword: {
      type: new GraphQLObjectType({
        name: 'ForgetPassword',
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
        email: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: async (user, { email }) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(ForgetPassword, await user.forgetPassword(email));
        }, {
          UNAUTHORIZED: USER.USER_NOT_FOUND,
        }, {
          UNAUTHORIZED: ErrorCode.CREDENTIAL_NOT_MATCH,
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
          UNAUTHORIZED: USER.USER_NOT_FOUND
        });
      },
    },
    updateUser: {
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
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
          UNIQUE_DUPLICATE: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
        });
      },
    },
    updatePerson: {
      type: ResponseType,
      args: {
        person: {
          type: new GraphQLNonNull(USER_INFORMATION_UPDATE_PERSON_INPUT)
        },
      },
      resolve: async (user, args) => {
        return handleResolveResult(async () => {
          await user.updateUser(args.person);
          return messageCreator(USER.UPDATE_SELF_INFORMATION_SUCCESS);
        }, {
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
          UNIQUE_DUPLICATE: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
        });
      }
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
