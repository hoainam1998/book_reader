const { createClient } = require('redis');
const Logger = require('#services/logger');
// eslint-disable-next-line no-unused-vars
const Event = require('./events/event');
const logger = new Logger('RedisClient');

/**
 * RedisClient wrapper.
 * @class
 */
class RedisClient {
  static instance;
  redisClient;

  /**
   * Create instance.
   * @constructor
   */
  constructor() {
    this.redisClient = createClient({ legacyMode: true });
    this.connect();
  }

  /**
   * Redis connect.
   */
  connect() {
    this.redisClient
      .connect()
      .then(() => logger.log('Connect was success!'))
      .catch((error) => logger.error(error));
  }

  /**
   * Redis publish.
   * @param {Event} - The event object.
   */
  publish(event) {
    this.redisClient
      .publish(event.eventName, event.plainToObject)
      .catch((error) => Logger.log('Redis Pub', error.message));
  }

  /**
   * Redis subscribe.
   * @param {string} - The event name.
   * @param {function} - The subscribe callback.
   */
  async subscribe(eventName, fn) {
    const subscriber = this.redisClient.duplicate();
    await subscriber.connect();
    subscriber.subscribe(eventName, fn).catch((error) => Logger.log('Redis Sub', error.message));
  }

  /**
   * Redis client object.
   */
  get Client() {
    return this.redisClient;
  }

  /**
   * Redis instance.
   * @static
   */
  static get Instance() {
    if (!this.instance) {
      this.instance = new RedisClient();
    }
    return this.instance;
  }
}

module.exports = RedisClient;
