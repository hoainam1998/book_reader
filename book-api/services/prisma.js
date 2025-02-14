const Singleton = require('#services/singleton.js');

/**
 * Class provided prisma instance.
 * @extends Singleton
 */
class Service extends Singleton {
  _prisma;

  /**
  * Create prisma service class.
  * @param {object} prisma - The prisma object.
  */
  constructor(prisma) {
    super(Service);
    this._prisma = prisma;
  }

  /**
  * Getter, return prisma instance.
  */
  get PrismaInstance() {
    if (!this._prisma) {
      throw new Error('PrismaInstance instance was not defined!');
    }
    return this._prisma;
  }
}

module.exports = Service;
