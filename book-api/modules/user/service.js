const { generateOtp } = require('#utils');
const { sign } = require('jsonwebtoken');
const Service = require('#services/prisma.js');

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
    return this.PrismaInstance.user.findFirst({
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
      if (user) {
        if (!user.mfa_enable) {
          return {
            ...user,
            apiKey: sign({ userId: user.user_id }, process.env.SECRET_KEY),
          };
        } else {
          return {
            ...user,
            apiKey: sign({ isLogin: true }, process.env.SECRET_KEY_LOGIN)
          };
        }
      }
      return user;
    });
  }

  updateOtpCode(email) {
    const otpCode = generateOtp();
    return this.PrismaInstance.user.updateMany({
      where: {
        email
      },
      data: {
        otp_code: otpCode
      },
    }).then(() => otpCode);
  }

  verifyOtpCode(email, otp) {
    return this.PrismaInstance.$transaction([
      this.PrismaInstance.user.count({
        where: {
          AND: [
            {
              email
            },
            {
              otp_code: otp
            }
          ]
        }
      }),
      this.PrismaInstance.user.findFirst({
        where: {
          email
        },
        select: {
          user_id: true,
          mfa_enable: true,
          email: true
        }
      }),
    ])
    .then((results) => {
      const verifyResult = {
        verify: false,
        apiKey: '',
      };

      const user = results[1];

      if (results[0]) {
        verifyResult.verify = true;
        verifyResult.apiKey = sign(
          { userId: user.user_id },
          process.env.SECRET_KEY
        );
      }
      return verifyResult;
    });
  }

  updatePerson(user) {
    const { firstName, lastName, avatar, email, password, userId } = user;
    return this.PrismaInstance.user.findFirst({
      where: {
        user_id: userId
      }
    }).then(oldUser => {
      return this.PrismaInstance.user.update({
        where: {
          user_id: userId
        },
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar: avatar,
          email: email,
          password: password
        },
      }).then(newUser => {
        if (oldUser.email !== newUser.email || oldUser.password !== newUser.password) {
          return {
            reLoginFlag: true
          };
        }
        return {
          reLoginFlag: false
        };
      });
    });
  }

  updateUser(user) {
    const { firstName, lastName, avatar, email, mfaEnable, userId } = user;
    return this.PrismaInstance.user.update({
      where: {
        user_id: userId,
      },
      data: {
        first_name: firstName,
        last_name: lastName,
        avatar: avatar,
        email: email,
        mfa_enable: mfaEnable
      },
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
    return this.PrismaInstance.user.findUnique({
      where: {
        user_id: userId
      },
      select
    });
  }

  getAllEmail() {
    return this.PrismaInstance.user.findMany({
      select: {
        email: true
      }
    });
  }
}

module.exports = UserService;
