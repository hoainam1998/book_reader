const { compare } = require('bcrypt');
const Service = require('#services/prisma');
const {
  generateOtp,
  autoGeneratePassword,
  signingResetPasswordToken,
  calcPages,
  checkArrayHaveValues
} = require('#utils');
const { USER } = require('#messages');
const { graphqlNotFoundErrorOption } = require('../common-schema');
const { GraphQLError } = require('graphql');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

class UserService extends Service {
  addUser(user) {
    const { firstName, lastName, email, phone, sex, power, mfaEnable } = user;

    return this.PrismaInstance.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        sex,
        power,
        phone,
        mfa_enable: mfaEnable,
      },
    });
  }

  pagination(pageSize, pageNumber, keyword, select) {
    select = { ...select, power: true };
    const offset = (pageNumber - 1) * pageSize;
    let paginationResultPromise;
    if (keyword) {
      paginationResultPromise = this.PrismaInstance.$transaction([
        this.PrismaInstance.user.findMany({
          select,
          where: {
            OR: [
              {
                last_name: {
                  contains: keyword
                }
              },
              {
                first_name: {
                  contains: keyword
                }
              }
            ],
          },
          orderBy: {
            user_id: 'desc'
          },
          take: pageSize,
          skip: offset
        }),
        this.PrismaInstance.user.count({
          where: {
            OR: [
              {
                last_name: {
                  contains: keyword
                }
              },
              {
                first_name: {
                  contains: keyword
                }
              }
            ]
          }
        })
      ]);
    } else {
      paginationResultPromise = this.PrismaInstance.$transaction([
        this.PrismaInstance.user.findMany({
          select,
          orderBy: {
            user_id: 'desc'
          },
          take: pageSize,
          skip: offset
        }),
        this.PrismaInstance.user.count(),
      ]);
    }

    return paginationResultPromise.then((users) => {
      const total = users[1];
      const pages = calcPages(pageSize, total);

      if (!checkArrayHaveValues(users[0])) {
        graphqlNotFoundErrorOption.response = {
          list: [],
          total: 0,
          pageSize,
          page: pageNumber,
          pages,
        };
        throw new GraphQLError(USER.USERS_EMPTY, graphqlNotFoundErrorOption);
      }
      users.push(pages);
      return users;
    });
  }

  updateMfaState(mfaEnable, userId) {
    return this.PrismaInstance.user.update({
      where: {
        user_id: userId
      },
      data: {
        mfa_enable: mfaEnable
      },
    });
  }

  updatePower(power, userId) {
    return this.PrismaInstance.user.update({
      where: {
        user_id: userId
      },
      data: {
        power
      }
    });
  }

  login(email, password, select) {
    return this.PrismaInstance.user.findFirstOrThrow({
      where: {
        email
      },
      select: {
        ...select,
        email: true,
        power: true,
        password: true,
        reset_password_token: true,
      }
    }).then((user) => {
      return compare(password, user.password)
        .then((compareResult) => {
          if (!compareResult) {
            throw new PrismaClientKnownRequestError('Password not match!', { code: 'P2025' });
          }
          return user;
        });
    });
  }

  async forgetPassword(email) {
    const password = autoGeneratePassword();
    return this.PrismaInstance.user.update({
      where: {
        email
      },
      data: {
        reset_password_token: signingResetPasswordToken(email),
        password,
      }
    }).then((user) => ({ ...user, password }));
  }

  resetPassword(resetPasswordToken, email, oldPassword, password) {
    return this.PrismaInstance.user.findFirstOrThrow({
      where: {
        reset_password_token: resetPasswordToken,
        email,
      },
    }).then(async (user) => {
      const passwordCompareResult = await compare(oldPassword, user.password);
      if (passwordCompareResult) {
        return this.PrismaInstance.user.update({
          where: {
            reset_password_token: resetPasswordToken,
            password: user.password,
            email,
          },
          data: {
            reset_password_token: null,
            password
          },
        });
      }
      throw new PrismaClientKnownRequestError('Password not match!', { code: 'P2025' });
    });
  }

  updateOtpCode(email) {
    const otpCode = generateOtp();
    return this.PrismaInstance.user.update({
      where: {
        email,
        mfa_enable: true,
      },
      data: {
        otp_code: otpCode
      },
    }).then((user) => user.otp_code);
  }

  verifyOtpCode(email, otp) {
    return this.PrismaInstance.user.update({
      where: {
        email,
        otp_code: otp,
        mfa_enable: true,
      },
      data: {
        otp_code: null
      }
    });
  }

  updateUser(user) {
    const { firstName, lastName, avatar, email, sex, phone, power, mfaEnable, userId } = user;
    const reduceUndefinedProps = (obj) => {
      return Object.keys(obj).reduce((objReduced, key) => {
        if (obj[key] !== undefined) {
          objReduced[key] = obj[key];
        }
        return objReduced;
      }, {});
    };

    return this.PrismaInstance.user.update({
      where: {
        user_id: userId,
      },
      data: reduceUndefinedProps({
        first_name: firstName,
        last_name: lastName,
        avatar: avatar,
        email: email,
        mfa_enable: mfaEnable,
        power,
        sex,
        phone,
      }),
    });
  }

  deleteUser(userId) {
    return this.PrismaInstance.user.delete({
      where: {
        user_id: userId
      },
    });
  }

  getUserDetail(userId, select) {
    return this.PrismaInstance.user.findUniqueOrThrow({
      where: {
        user_id: userId
      },
      select
    });
  }

  getAllUsers(exclude, select) {
    const conditions = exclude
    ? {
      where: {
        user_id: {
          not: exclude
        }
      },
    } : {};

    return this.PrismaInstance.user.findMany({
      ...conditions,
      select: { ...select, power: true },
    }).then((result) => {
     if (!checkArrayHaveValues(result)) {
        graphqlNotFoundErrorOption.response = [];
        throw new GraphQLError(USER.USER_NOT_FOUND, graphqlNotFoundErrorOption);
      }
      return result;
    });
  }
}

module.exports = UserService;
