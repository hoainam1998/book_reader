const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLError, GraphQLID, GraphQLInt, GraphQLInputObjectType, GraphQLList } = require('graphql');
const { message } = require('#utils');
const { messageCreator } = require('#utils');
const { ResponseType, graphqlErrorOption, graphqlNotFoundErrorOption } = require('../common-schema');

const userInformationFields = {
  userId: {
    type: GraphQLID
  },
  email: {
    type: GraphQLString
  },
  avatar: {
    type: GraphQLString
  },
  mfaEnable: {
    type: GraphQLBoolean
  }
};

const UserInformationInput = new GraphQLInputObjectType({
  name: 'UserInformationInput',
  fields: {
    ... userInformationFields,
    firstName: {
      type: GraphQLString
    },
    lastName: {
      type: GraphQLString
    }
  }
});

const UserInformationUpdate = new GraphQLObjectType({
  name: 'UserInformationUpdate',
  fields: {
    email: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    },
    mfaEnable: {
      type: GraphQLBoolean
    },
    firstName: {
      type: GraphQLString
    },
    lastName: {
      type: GraphQLString
    }
  }
});

const UserInformation = new GraphQLObjectType({
  name: 'UserInformation',
  fields: {
    ...userInformationFields,
    name: {
      type: GraphQLString
    }
  }
});

const query = new GraphQLObjectType({
  name: 'UserQuery',
  fields: {
    pagination: {
      type: new GraphQLObjectType({
        name: 'UserPagination',
        fields: {
          list: {
            type: new GraphQLList(UserInformation)
          },
          total: {
            type: GraphQLInt
          }
        }
      }),
      args: {
        pageSize: {
          type: GraphQLInt
        },
        pageNumber: {
          type: GraphQLInt
        },
        keyword: {
          type: GraphQLString
        }
      },
      resolve: async (user, { pageSize, pageNumber, keyword }) => {
        try {
          const result = await user.pagination(pageSize, pageNumber, keyword);
          if (result[0].length === 0) {
            throw new GraphQLError('User is empty', graphqlNotFoundErrorOption);
          }
          return {
            list: result[0],
            total: result[1][0].total
          };
        } catch(err) {
          if (err instanceof GraphQLError) {
            throw err;
          }
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    detail: {
      type: UserInformationUpdate,
      args: {
        userId: {
          type: GraphQLID
        }
      },
      resolve: async (user, { userId }) => {
        try {
          const userDetail = await user.getUserDetail(userId);
          return userDetail[0];
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'UserMutation',
  fields: {
    add: {
      type: ResponseType,
      args: {
        user: {
          type: UserInformationInput
        }
      },
      resolve: async (user, args) => {
        try {
          await user.addUser(args.user);
          return messageCreator('Add user success!');
        } catch(err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    updateMfaState: {
      type: ResponseType,
      args: {
        userId: {
          type: GraphQLID
        },
        mfaEnable: {
          type: GraphQLBoolean
        }
      },
      resolve: async (user, { userId, mfaEnable }) => {
        try {
          await user.updateMfaState(mfaEnable, userId);
          return messageCreator(`Update mfs state for user_id = ${userId} success!`);
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    update: {
      type: ResponseType,
      args: {
        user: {
          type: UserInformationInput
        }
      },
      resolve: async (user, args) => {
        try {
          await user.updateUser(args.user);
          return messageCreator('Update user success!');
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    },
    delete: {
      type: ResponseType,
      args: {
        userId: {
          type: GraphQLID
        }
      },
      resolve: async (user, { userId }) => {
        try {
          await user.deleteUser(userId);
          return messageCreator(`Delete user with user_id = ${userId} success!`);
        } catch (err) {
          throw new GraphQLError(err.message, graphqlErrorOption);
        }
      }
    }
  }
});

module.exports = {
  query,
  mutation
};
