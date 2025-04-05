const { generateOtp } = require('#utils');
const { sign } = require('jsonwebtoken');
const { compare } = require('bcrypt');
const Service = require('#services/prisma');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

class UserService extends Service {
  addUser(user) {
    const { firstName, lastName, avatar, email, sex, power, mfaEnable } = user;

    return this.PrismaInstance.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        avatar,
        email,
        sex,
        power,
        mfa_enable: mfaEnable,
      },
    });
  }

  pagination(pageSize, pageNumber, keyword, select) {
    const offset = (pageNumber - 1) * pageSize;
    if (keyword) {
      return this.PrismaInstance.$transaction([
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
            ]
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
    }
    return this.PrismaInstance.$transaction([
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

  login(email, password, select) {
    return this.PrismaInstance.user.findFirstOrThrow({
      where: {
        email
      },
      select: {
        ...select,
        login_token: true,
        password: true,
        reset_password_token: true,
      }
    }).then((user) => {
      return compare(password, user.password)
        .then((compareResult) => {
          if (compareResult) {
            let apiKey = sign({ isLogin: true }, process.env.SECRET_KEY_LOGIN);
            if (!user.reset_password_token) {
              if (!user.mfa_enable) {
                return apiKey = user.login_token;
              }
            }
            return { ...user, apiKey };
          }
          throw new PrismaClientKnownRequestError('Password not match!', { code: 'P2025' });
        });
    });
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
        email
      },
      data: {
        otp_code: otpCode
      },
    }).then(() => otpCode);
  }

  verifyOtpCode(email, otp) {
    return this.PrismaInstance.user.findFirstOrThrow({
      where: {
        AND: [
          {
            email
          },
          {
            otp_code: otp
          }
        ]
      },
      select: {
        user_id: true,
        mfa_enable: true,
        email: true
      }
    })
    .then((user) => ({
      apiKey: sign(
        { userId: user.user_id },
        process.env.SECRET_KEY
      )
    }));
  }

  updateUser(user) {
    const { firstName, lastName, avatar, email, password, mfaEnable, userId } = user;
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
        password,
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

  getAllUsers(select) {
    return this.PrismaInstance.user.findMany({
      select
    });
  }
}

module.exports = UserService;
