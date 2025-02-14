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
const { messageCreator } = require('#utils');
const { plainToInstance } = require('class-transformer');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const UserDTO = require('#dto/user/user.js');
const OtpVerify = require('#dto/user/otp-verify.js');
const OtpUpdate = require('#dto/user/otp-update.js');
const EmailDTO = require('#dto/user/email.js');

const {
  ResponseType,
  graphqlErrorOption,
  graphqlNotFoundErrorOption,
} = require('../common-schema');

const userInformationFields = {
  userId: {
    type: GraphQLID,
  },
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

const UserInformationInput = new GraphQLInputObjectType({
  name: 'UserInformationInput',
  fields: {
    ...userInformationFields,
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
  },
});

const UserInformationUpdate = new GraphQLObjectType({
  name: 'UserInformationUpdate',
  fields: {
    email: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    mfaEnable: {
      type: GraphQLBoolean,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
  },
});

const UserLoginInformation = new GraphQLObjectType({
  name: 'UserLoginInformation',
  fields: {
    email: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    mfaEnable: {
      type: GraphQLBoolean,
    },
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

const UserInformation = new GraphQLObjectType({
  name: 'UserInformation',
  fields: {
    ...userInformationFields,
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
            type: new GraphQLList(UserInformation),
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
        const result = await user.pagination(pageSize, pageNumber, keyword, context);
        if (result && result[0].length === 0) {
          throw new GraphQLError('User is empty', graphqlNotFoundErrorOption);
        }

        return {
          list: plainToInstance(UserDTO, result[0]),
          total: result[1]
        };
      },
    },
    emails: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      resolve: async (user) => {
        const emails = await user.getAllEmail();
        if (emails && emails.length === 0) {
          throw new GraphQLError('Email user is empty', graphqlNotFoundErrorOption);
        }
        return plainToInstance(EmailDTO, emails).map(({ email }) => email);
      }
    },
    detail: {
      type: UserInformationUpdate,
      args: {
        userId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve: async (user, { userId }, context) => {
        const userDetail = await user.getUserDetail(userId, context);
        if (!userDetail) {
          throw new GraphQLError('Can not found user!', graphqlNotFoundErrorOption);
        }
        return plainToInstance(UserDTO, userDetail);
      },
    },
    login: {
      type: UserLoginInformation,
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
        password: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (user, { email, password }, context) => {
        const userLogin = await user.login(email, password, context);
        if (userLogin) {
          return plainToInstance(UserDTO, userLogin);
        }
        throw new GraphQLError('Can not found user!', graphqlNotFoundErrorOption);
      },
    },
    verifyOtp: {
      type: new GraphQLObjectType({
        name: 'VerifyOtp',
        fields: {
          verify: {
            type: GraphQLBoolean,
          },
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
        const result = await user.verifyOtpCode(email, otp);
        return plainToInstance(OtpVerify, result);;
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
          type: new GraphQLNonNull(UserInformationInput),
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
          const { email } = await user.updateMfaState(mfaEnable, userId);
          return messageCreator(`Update mfa state for email: ${email} success!`);
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
        const otp = await user.updateOtpCode(email);
        return plainToInstance(OtpUpdate, { ...messageCreator('Otp code has sent to your email!'), otp });
      },
    },
    update: {
      type: ResponseType,
      args: {
        user: {
          type: new GraphQLNonNull(UserInformationInput),
        },
      },
      resolve: async (user, args) => {
        await user.updateUser(args.user);
        return messageCreator('Update user success!');
      },
    },
    updatePerson: {
      type: new GraphQLObjectType({
        name: 'UpdatePersonResponse',
        fields: {
          message: {
            type: GraphQLString
          },
          reLoginFlag: {
            type: GraphQLBoolean
          }
        }
      }),
      args: {
        person: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'PersonInputType',
            fields: {
              userId: {
                type: GraphQLID,
              },
              firstName: {
                type: GraphQLString,
              },
              lastName: {
                type: GraphQLString,
              },
              email: {
                type: GraphQLString,
              },
              avatar: {
                type: GraphQLString,
              },
              password: {
                type: GraphQLString,
              },
            },
          })),
        }
      },
      resolve: async (user, { person }) => {
        const personalInfo = await user.updatePerson(person);
        return {
          ...messageCreator('Update your personal information success!'),
          ...personalInfo
        };
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
        try {
          const { email } = await user.deleteUser(userId);
          return messageCreator(
            `Delete user with email = ${email} success!`
          );
        } catch (error) {
          if (error instanceof PrismaClientKnownRequestError) {
            throw new GraphQLError(error.meta.cause, graphqlErrorOption);
          }
          throw error;
        }
      },
    },
  },
});

module.exports = {
  query,
  mutation,
};
