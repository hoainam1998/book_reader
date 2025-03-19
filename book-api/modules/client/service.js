const Service = require("#services/prisma.js");

class ClientService extends Service {
  signUp(firstName, lastName, email, password) {
    return this.PrismaInstance.reader.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      },
    });
  }

  forgetPassword(email, resetToken) {
    return this.PrismaInstance.reader.update({
      where: {
        email,
      },
      data: {
        reset_password_token: resetToken,
      }
    });
  }

  resetPassword(token, email, password) {
    return this.PrismaInstance.reader.update({
      where: {
        email,
        reset_password_token: token
      },
      data: {
        password,
        reset_password_token: null
      }
    });
  }

  getClientDetail(emailOrId, select) {
    return this.PrismaInstance.reader.findFirstOrThrow({
      where: {
        OR: [
          {
            email: emailOrId
          },
          {
            reader_id: emailOrId
          },
        ],
      },
      select,
    });
  }
}

module.exports = ClientService;
