const Service = require('#services/prisma');
const { compare } = require('bcrypt');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const { signClientResetPasswordToken, autoGeneratePassword } = require('#utils');
const { READER } = require('#messages');

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

  forgetPassword(email) {
    const resetToken = signClientResetPasswordToken(email);
    const randomPassword = autoGeneratePassword();
    return this.PrismaInstance.reader.update({
      where: {
        email,
      },
      data: {
        reset_password_token: resetToken,
        password: randomPassword,
      }
    })
    .then((client) => ({ ...client, plain_password: randomPassword }));
  }

  resetPassword(token, email, oldPassword, password) {
    return this.PrismaInstance.reader.findFirstOrThrow({
      where: {
        reset_password_token: token,
        email,
      },
      select: {
        password: true,
      },
    }).then(async (client) => {
      if (await compare(oldPassword, client.password)) {
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
      throw new PrismaClientKnownRequestError(READER.OLD_PASSWORD_NOT_MATCH, { code: 'P2025' });
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

  login(email, password, select) {
    select = { ...select, password: true };
    return this.getClientDetail(email, select)
      .then(async (client) => {
        if (await compare(password, client.password)) {
          return client;
        }
        throw new PrismaClientKnownRequestError(READER.PASSWORD_NOT_MATCH, { code: 'P2025' });
      });
  }
}

module.exports = ClientService;
