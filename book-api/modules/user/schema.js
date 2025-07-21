const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const { messageCreator, convertDtoToZodObject } = require('#utils');
const { USER } = require('#messages');
const handleResolveResult = require('#utils/handle-resolve-result');
const ErrorCode = require('#services/error-code');
const UserDTO = require('#dto/user/user');
const OtpVerify = require('#dto/user/otp-verify');
const OtpUpdate = require('#dto/user/otp-update');
const UserCreated = require('#dto/user/user-created');
const ForgetPassword = require('#dto/user/forget-password');
const PaginationResponse = require('#dto/common/pagination-response');
const { ResponseType } = require('../common-schema');

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
      type: new GraphQLNonNull(GraphQLInt),
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
      type: new GraphQLNonNull(GraphQLInt),
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
    mfaEnable: {
      type: GraphQLBoolean,
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
      type: GraphQLInt,
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
    isAdmin: {
      type: GraphQLBoolean,
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
            type: new GraphQLNonNull(new GraphQLList(USER_INFORMATION)),
          },
          total: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          page: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          pages: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          pageSize: {
            type: new GraphQLNonNull(GraphQLInt),
          },
        },
      }),
      args: {
        pageSize: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        pageNumber: {
          type: new GraphQLNonNull(GraphQLInt),
        },
        keyword: {
          type: GraphQLString,
        },
        yourId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        yourRole: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (service, { pageSize, pageNumber, keyword, yourId, yourRole }, context) => {
        const [users, total, pages] = await service.pagination(pageSize, pageNumber, keyword, yourId, yourRole, context);
        return convertDtoToZodObject(PaginationResponse, {
          list: plainToInstance(UserDTO, users),
          total: parseInt(total || 0),
          pages,
          page: pageNumber,
          pageSize,
        });
      },
    },
    all: {
      type: new GraphQLList(new GraphQLNonNull(USER_INFORMATION)),
      args: {
        exclude: {
          type: GraphQLID,
        },
        yourId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        yourRole: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (service, { exclude, yourId, yourRole }, context) => {
        const users = await service.getAllUsers(exclude, yourId, yourRole, context);
        return convertDtoToZodObject(UserDTO, users);
      },
    },
    detail: {
      type: USER_INFORMATION_DETAIL,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        yourRole: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (service, { userId, yourRole }, context) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(UserDTO, await service.getUserDetail(userId, yourRole, context));
          },
          {
            RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
          }
        );
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
          firstName: {
            type: new GraphQLNonNull(GraphQLString),
          },
          lastName: {
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
      resolve: async (service, { email, password }, context) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(UserDTO, await service.login(email, password, context));
          },
          {
            UNAUTHORIZED: USER.USER_NOT_FOUND,
          }
        );
      },
    },
    verifyOtp: {
      type: new GraphQLObjectType({
        name: 'VerifyOtp',
        fields: {
          apiKey: {
            type: new GraphQLNonNull(GraphQLString),
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
      resolve: async (service, { email, otp }) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(OtpVerify, await service.verifyOtpCode(email, otp));
          },
          {
            UNAUTHORIZED: USER.VERIFY_OTP_FAIL_DUE_MISSING_OTP_OR_EMAIL,
          }
        );
      },
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
      resolve: async (service, args) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(UserCreated, await service.addUser(args.user));
          },
          {
            UNIQUE_DUPLICATE: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
          }
        );
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
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (service, { email }) => {
        return handleResolveResult(
          async () => {
            return convertDtoToZodObject(ForgetPassword, await service.forgetPassword(email));
          },
          {
            UNAUTHORIZED: USER.USER_NOT_FOUND,
          }
        );
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
      resolve: async (service, { resetPasswordToken, email, oldPassword, password }) => {
        return handleResolveResult(
          async () => {
            await service.resetPassword(resetPasswordToken, email, oldPassword, password);
            return messageCreator(USER.RESET_PASSWORD_SUCCESS);
          },
          {
            UNAUTHORIZED: USER.USER_NOT_FOUND,
          }
        );
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
      resolve: async (service, { userId, mfaEnable }) => {
        return handleResolveResult(
          async () => {
            const { email } = await service.updateMfaState(mfaEnable, userId);
            return messageCreator(USER.UPDATE_MFA_STATE_SUCCESS.format(email));
          },
          {
            RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
          }
        );
      },
    },
    updatePower: {
      type: ResponseType,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
        power: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: async (service, { userId, power }) => {
        return handleResolveResult(
          async () => {
            const { email } = await service.updatePower(power, userId);
            return messageCreator(USER.UPDATE_POWER_SUCCESS.format(email));
          },
          {
            RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
          }
        );
      },
    },
    updateOtpCode: {
      type: new GraphQLObjectType({
        name: 'Otp',
        fields: {
          otp: {
            type: new GraphQLNonNull(GraphQLString),
          },
          message: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
      }),
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (service, { email }) => {
        return handleResolveResult(
          async () => {
            const otp = await service.updateOtpCode(email);
            return convertDtoToZodObject(OtpUpdate, { ...messageCreator(USER.OTP_HAS_BEEN_SENT), otp });
          },
          {
            UNAUTHORIZED: USER.USER_NOT_FOUND,
          },
          {
            UNAUTHORIZED: ErrorCode.CREDENTIAL_NOT_MATCH,
          }
        );
      },
    },
    updateUser: {
      type: ResponseType,
      args: {
        user: {
          type: new GraphQLNonNull(USER_INFORMATION_INPUT),
        },
      },
      resolve: async (service, args) => {
        return handleResolveResult(
          async () => {
            await service.updateUser(args.user);
            return messageCreator(USER.UPDATE_USER_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
            UNIQUE_DUPLICATE: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
          }
        );
      },
    },
    updatePerson: {
      type: ResponseType,
      args: {
        person: {
          type: new GraphQLNonNull(USER_INFORMATION_UPDATE_PERSON_INPUT),
        },
      },
      resolve: async (service, args) => {
        return handleResolveResult(
          async () => {
            await service.updateUser(args.person);
            return messageCreator(USER.UPDATE_SELF_INFORMATION_SUCCESS);
          },
          {
            RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
            UNIQUE_DUPLICATE: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
          }
        );
      },
    },
    delete: {
      type: ResponseType,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (service, { userId }) => {
        return handleResolveResult(
          async () => {
            const { email } = await service.deleteUser(userId);
            return messageCreator(USER.DELETE_USER_SUCCESS.format(email));
          },
          {
            RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
          }
        );
      },
    },
  },
});

module.exports = {
  query,
  mutation,
};
