/**
 * Any class extend this class, then will not instantiated by itself.
 * @class
 */
class Singleton {
  /**
   * Create singleton class.
   * @param {singleClass} singleClass - The single class.
   */
  constructor(singleClass) {
    // if single class is instant, it will throw error.
    if (this.constructor === singleClass) {
      throw new Error(`${singleClass.name} can't be instantiated!`);
    }
  }
}

module.exports = Singleton;
