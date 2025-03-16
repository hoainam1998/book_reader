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
}

module.exports = ClientService;
