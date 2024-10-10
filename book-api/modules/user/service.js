const { generateOtp } = require('#utils');
const { sign } = require('jsonwebtoken');

class UserService {
  _sql = null;

  constructor(sql) {
    this._sql = sql;
  }

  addUser(user) {
    const { firstName, lastName, avatar, email, mfaEnable, userId } = user;
    return this._sql.query('INSERT INTO USER(USER_ID, FIRST_NAME, LAST_NAME, AVATAR, EMAIL, MFA_ENABLE) VALUES(?)',
      [[userId, firstName, lastName, avatar, email, mfaEnable]]);
  }

  pagination(pageSize, pageNumber, keyword) {
    const query = `
      SELECT USER_ID AS userId,
      CONCAT(user.FIRST_NAME, ' ', user.LAST_NAME) AS name,
      AVATAR AS avatar,
      EMAIL AS email,
      MFA_ENABLE AS mfaEnable FROM USER AS user`
    const offset = (pageNumber - 1) * pageSize;
    if (keyword) {
      return this._sql.query(`
        ${query} WHERE user.LAST_NAME LIKE '%${keyword}%' OR user.FIRST_NAME LIKE '%${keyword}%' ORDER BY USER_ID DESC LIMIT ${pageSize} OFFSET ${offset};
        SELECT COUNT(*) AS total FROM USER WHERE user.LAST_NAME LIKE '%${keyword}%' OR user.FIRST_NAME LIKE '%${keyword}%'`
      );
    }
    return this._sql.query(
      `${query} ORDER BY USER_ID DESC LIMIT ? OFFSET ?;
      SELECT COUNT(*) AS total FROM USER`,
      [pageSize, (pageNumber - 1) * pageSize]
    );
  }

  updateMfaState(mfaEnable, userId) {
    return this._sql.query('UPDATE USER SET MFA_ENABLE = ? WHERE USER_ID = ?', [mfaEnable, userId]);
  }

  login(email, password) {
    return this._sql.query(
      `SELECT USER_ID AS userId,
      CONCAT(user.FIRST_NAME, " ", user.LAST_NAME) AS name,
      AVATAR AS avatar,
      MFA_ENABLE AS mfaEnable FROM USER AS user
      WHERE EMAIL = ? AND PASSWORD = ?`,
    [email, password]).then(userMatches => {
      const user = userMatches[0];
      if (user && user.mfaEnable === 0) {
        return {
          ...user,
          apiKey: sign({ mfaEnable: user.mfaEnable, email: user.email  }, process.env.SECRET_KEY)
        };
      }
      return user;
    });
  }

  updateOtpCode(email) {
    const otpCode = generateOtp();
    return this._sql.query(`UPDATE USER SET OTP_CODE = ? WHERE EMAIL = ?`, [otpCode, email])
      .then(() => otpCode);
  }

  verifyOtpCode(email, otp) {
    return this._sql.query(
      `SELECT EXISTS(SELECT COUNT(*) FROM USER WHERE EMAIL = ? AND OTP_CODE = ?) AS existUser;
      SELECT MFA_ENABLE AS mfaEnable, EMAIL AS email FROM USER WHERE EMAIL = ?`, [email, otp, email])
      .then(results => {
        const verifyResult = {
          verify: false,
          apiKey: ''
        };

        const user = results[1][0];

        if (results[0][0].existUser === 1) {
          verifyResult.verify = true;
          verifyResult.apiKey = sign({ mfaEnable: user.mfaEnable, email: user.email  }, process.env.SECRET_KEY)
        }
        return verifyResult;
      });
  }

  updateUser(user) {
    const { firstName, lastName, avatar, email, mfaEnable, userId } = user;
    return this._sql.query(
      'UPDATE USER SET FIRST_NAME = ?, LAST_NAME = ?, AVATAR = ?, EMAIL = ?, MFA_ENABLE = ? WHERE USER_ID = ?',
        [firstName, lastName, avatar, email, mfaEnable, userId]);
  }

  deleteUser(userId) {
    return this._sql.query('DELETE FROM USER WHERE USER_ID = ?', [userId]);
  }

  getUserDetail(userId) {
    return this._sql.query(
      `SELECT FIRST_NAME AS firstName, LAST_NAME AS lastName, AVATAR AS avatar, EMAIL AS email, mfa_enable AS mfaEnable FROM USER WHERE USER_ID = ${userId}`
    );
  }
}

module.exports = UserService;
