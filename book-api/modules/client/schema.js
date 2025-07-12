const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
} = require('graphql');
const { plainToInstance } = require('class-transformer');
const ClientDTO = require('#dto/client/client');
const { ResponseType } = require('../common-schema');
const { messageCreator, convertDtoToZodObject } = require('#utils');
const ForgetPassword = require('#dto/client/forget-password');
const PaginationResponse = require('#dto/common/pagination-response');
const handleResolveResult = require('#utils/handle-resolve-result');
const { READER, USER } = require('#messages');

const CLIENT = {
  clientId: {
    type: GraphQLID,
  },
  firstName: {
    type: GraphQLString,
  },
  lastName: {
    type: GraphQLString,
  },
  name: {
    type: GraphQLString,
  },
  avatar: {
    type: GraphQLString,
  },
  email: {
    type: GraphQLString,
  },
  sex: {
    type: GraphQLInt,
  },
  phone: {
    type: GraphQLString,
  },
};

const CLIENT_RELATE_BOOKS = new GraphQLObjectType({
  name: 'RelateBook',
  fields: {
    bookId: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString
    },
    authors: {
      type: new GraphQLList(new GraphQLObjectType({
        name: 'AuthorRelative',
        fields: {
          name: {
            type: GraphQLString
          },
          authorId: {
            type: GraphQLString
          }
        }
      }))
    },
    avatar: {
      type: GraphQLString
    },
    createAt: {
      type: GraphQLString
    },
  }
});

const CLIENT_DETAIL_TYPE = new GraphQLObjectType({
  name: 'ClientDetail',
  fields: {
    ...CLIENT,
    apiKey: {
      type: GraphQLString,
    },
    resetPasswordToken: {
      type: GraphQLString,
    },
    passwordMustChange: {
      type: GraphQLBoolean,
    },
    favoriteBooks: {
      type: new GraphQLList(CLIENT_RELATE_BOOKS),
    },
    readLate: {
      type: new GraphQLList(CLIENT_RELATE_BOOKS),
    },
    usedRead: {
      type: new GraphQLList(CLIENT_RELATE_BOOKS),
    }
  }
});

const CLIENT_INPUT_TYPE = new GraphQLInputObjectType({
  name: 'ClientInputType',
  fields: CLIENT,
});

const CLIENT_TYPE = new GraphQLObjectType({
  name: 'ClientType',
  fields: CLIENT,
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
        },
        sex: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: async (service, { firstName, lastName, email, password, sex }) => {
        return handleResolveResult(async () => {
          await service.signUp(firstName, lastName, email, password, sex);
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
    },
    updateClient: {
      type: ResponseType,
      args: {
        client: {
          type: new GraphQLNonNull(CLIENT_INPUT_TYPE),
        }
      },
      resolve: async (service, { client }) => {
        return handleResolveResult(async () => {
          await service.update(client);
          return messageCreator(READER.ADD_PERSONAL_INFORMATION_SUCCESS);
        }, {
          RECORD_NOT_FOUND: USER.USER_NOT_FOUND,
          UNIQUE_DUPLICATE: USER.DUPLICATE_EMAIL_OR_PHONE_NUMBER,
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
    },
    detail: {
      type: new GraphQLNonNull(CLIENT_DETAIL_TYPE),
      args: {
        clientId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async (service, { clientId }, context) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(ClientDTO, await service.detail(clientId, context));
        }, {
          RECORD_NOT_FOUND: READER.USER_NOT_FOUND,
        });
      }
    },
    all: {
      type: new GraphQLNonNull(new GraphQLList(CLIENT_TYPE)),
      args: {
        exclude: {
          type: GraphQLID
        }
      },
      resolve: async (service, { exclude }, context) => {
        return handleResolveResult(async () => {
          return convertDtoToZodObject(ClientDTO, await service.all(exclude, context));
        }, {
          RECORD_NOT_FOUND: READER.USER_NOT_FOUND,
        });
      }
    },
    pagination: {
      type: new GraphQLObjectType({
        name: 'ClientPagination',
        fields: {
          list: {
            type: new GraphQLNonNull(new GraphQLList(CLIENT_TYPE))
          },
          total: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          page: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          pages: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          pageSize: {
            type: new GraphQLNonNull(GraphQLInt)
          },
        },
      }),
      args: {
        pageSize: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        pageNumber: {
          type: new GraphQLNonNull(GraphQLInt)
        },
        keyword: {
          type: GraphQLString,
        },
      },
      resolve: async (service, { pageSize, pageNumber, keyword }, context) => {
        const [clients, total, pages] = await service.pagination(pageSize, pageNumber, keyword, context);
        return convertDtoToZodObject(PaginationResponse, {
          list: plainToInstance(ClientDTO, clients),
          total: parseInt(total || 0),
          page: pageNumber,
          pages,
          pageSize,
        });
      },
    },
  }
});

module.exports = {
  mutation,
  query,
};
