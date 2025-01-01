class Service {
  _prisma;

  constructor(prisma) {
    this._prisma = prisma;
  }

  get PrismaInstance() {
    if (!this._prisma) {
      throw new Error('PrismaInstance instance was not defined!');
    }
    return this._prisma;
  }
}

module.exports = Service;
