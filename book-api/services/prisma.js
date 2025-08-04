const Singleton = require('#services/singleton');

/**
 * Class provided prisma instance.
 * @class
 * @extends Singleton
 */
class Service extends Singleton {
  _prisma;
  _redisClient;

  /**
   * Create prisma service class.
   * @param {Object} prisma - The prisma object.
   */
  constructor(prisma, redisClient) {
    super(Service);
    this._prisma = prisma;
    this._redisClient = redisClient;
  }

  get RedisClient() {
    return this._redisClient;
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
