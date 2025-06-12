const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');
const { endpoint } = require('#decorators');
const Singleton = require('#services/singleton');
const SharedService = require('#services/shared');
const { Socket } = require('#services/socket');

/**
* Base router class.
* This class organize the base methods will using another router extended class.
* @class
* @extends Singleton
*/
class Router extends Singleton {
  _express = null;
  _router = null;
  _service = null;
  _socket = null;
  _redisClient = null;

  /**
  * Prisma client instance.
  *
  * @static
  */
  static PrismaClient;

  /**
  * Redis client instance.
  *
  * @static
  */
  static RedisClient;

  /**
  * Create router instance.
  *
  * @param {object} express - The express object.
  * @param {object} graphqlExecute - The graphql execute instance.
  */
  constructor(express, graphqlExecute) {
    super(Router);
    this._express = express;
    this._router = express.Router();
    this._service = new SharedService(Router.PrismaClient);
    this._socket = Socket.getInstance();
    this._redisClient = Router.RedisClient;
    // if everything are fine then run right middleware, else return server error response.
    this._router.all('*', (_, res, next) => {
      if (graphqlExecute) {
        next();
      } else {
        res.status(HTTP_CODE.SERVER_ERROR)
          .json(messageCreator('Server error. Please contact my admin!'));
      }
    });
  }

  /**
  * Return router object.
  *
  * @return {object} - The router object.
  */
  get Router() {
    return this._router;
  }

  /**
  * Return shared service object.
  *
  * @return {object} - The shared service object.
  */
  get Service() {
    return this._service;
  }

  /**
  * Return socket startup object.
  *
  * @return {object} - The socket startup object.
  */
  get Socket() {
    return this._socket;
  }

  /**
  * Return redis store object.
  *
  * @return {object} - The redis store object.
  */
  get RedisStore() {
    return this._redisClient;
  }

  /**
  * Register post request method.
  *
  * @param {...*} - The post arguments method.
  */
  @endpoint
  post(...args) {
    this._router.post.apply(this._router, args);
  }

  /**
  * Register put request method.
  *
  * @param {...*} - The put arguments method.
  */
  @endpoint
  put(...args) {
    this._router.put.apply(this._router, args);
  }

  /**
  * Register get request method.
  *
  * @param {...*} - The get arguments method.
  */
  @endpoint
  get(...args) {
    this._router.get.apply(this._router, args);
  }

  /**
  * Register delete request method.
  *
  * @param {...*} - The delete arguments method.
  */
  @endpoint
  delete(...args) {
    this._router.delete.apply(this._router, args);
  }
}

module.exports = Router;
