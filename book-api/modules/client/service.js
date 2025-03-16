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

  forgetPassword(email, resetToken, passwordExpires) {
    return this.PrismaInstance.reader.update({
      where: {
        email,
      },
      data: {
        reset_password_token: resetToken,
        password_reset_expires: passwordExpires,
      },
    });
  }
}

module.exports = ClientService;
