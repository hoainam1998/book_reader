const { generateOtp } = require('#utils');
const { sign } = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const Service = require('../service');

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

  pagination(pageSize, pageNumber, keyword) {
    const query = Prisma.sql`
    SELECT USER_ID AS userId,
    CONCAT(user.FIRST_NAME, " ", user.LAST_NAME) AS name,
    AVATAR AS avatar,
    EMAIL AS email,
    MFA_ENABLE AS mfaEnable FROM USER AS user`;
    const offset = (pageNumber - 1) * pageSize;
    if (keyword) {
      return this.PrismaInstance.$transaction([
        this.PrismaInstance.$queryRaw`${query} WHERE user.LAST_NAME LIKE '%${keyword}%' OR user.FIRST_NAME LIKE '%${keyword}%' ORDER BY USER_ID DESC LIMIT ${pageSize} OFFSET ${offset};`,
        this.PrismaInstance.$queryRaw`SELECT COUNT(*) AS total FROM USER WHERE user.LAST_NAME LIKE '%${keyword}%' OR user.FIRST_NAME LIKE '%${keyword}%';`
      ]);
    }
    return this.PrismaInstance.$transaction([
      this.PrismaInstance.$queryRaw`${query} ORDER BY USER_ID DESC LIMIT ${pageSize} OFFSET ${offset};`,
      this.PrismaInstance.$queryRaw`SELECT COUNT(*) AS total FROM USER;`,
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

  login(email, password) {
    return this.PrismaInstance.$queryRaw
      `SELECT USER_ID AS userId,
      CONCAT(user.FIRST_NAME, " ", user.LAST_NAME) AS name,
      PASSWORD AS password,
      AVATAR AS avatar,
      MFA_ENABLE AS mfaEnable FROM USER AS user
      WHERE EMAIL = ${email} AND PASSWORD = ${password}`
      .then((userMatches) => {
      const user = userMatches[0];
      if (user && user.mfaEnable === 0) {
        return {
          ...user,
          apiKey: sign({ userId: user.userId }, process.env.SECRET_KEY),
        };
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
      this.PrismaInstance.$queryRaw`SELECT EXISTS(SELECT * FROM USER WHERE EMAIL = ${email} AND OTP_CODE = ${otp}) AS existUser;`,
      this.PrismaInstance.$queryRaw`SELECT USER_ID AS userId, MFA_ENABLE AS mfaEnable, EMAIL AS email FROM USER WHERE EMAIL = ${email};`
    ])
    .then((results) => {
        const verifyResult = {
          verify: false,
          apiKey: '',
        };

        const user = results[1][0];

        if (results[0][0].existUser === 1) {
          verifyResult.verify = true;
          verifyResult.apiKey = sign(
            { userId: user.userId },
            process.env.SECRET_KEY
          );
        }
        return verifyResult;
      });
  }

  updatePerson(user) {
    const { firstName, lastName, avatar, email, password, userId } = user;
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

  getUserDetail(userId) {
    return this.PrismaInstance.$queryRaw`
      SELECT FIRST_NAME AS firstName,
      LAST_NAME AS lastName,
      AVATAR AS avatar,
      EMAIL AS email,
      MFA_ENABLE AS mfaEnable
      FROM USER WHERE USER_ID = ${userId}`;
  }
}

module.exports = UserService;
