const { generateOtp } = require('#utils');
const { sign } = require('jsonwebtoken');
const Service = require('#services/prisma');

class UserService extends Service {
  addUser(user) {
    const { firstName, lastName, avatar, email, mfaEnable, userId } = user;
    return this.PrismaInstance.user.create({
      data: {
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        avatar: avatar,
        email: email,
        mfa_enable: mfaEnable
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
        AND: [
          {
            email
          },
          {
            password
          }
        ]
      },
      select: {
        ...select,
        user_id: true
      }
    }).then((user) => {
      let apiKey;
      if (!user.mfa_enable) {
        apiKey = sign({ userId: user.user_id, email }, process.env.SECRET_KEY);
      } else {
        apiKey = sign({ isLogin: true }, process.env.SECRET_KEY_LOGIN);
      }
      return { ...user, apiKey };
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
