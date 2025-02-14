const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');
const { endpoint } = require('#decorators');
const Singleton = require('#services/singleton.js');

/**
* Base router class.
* This class organize the base methods will using another router extended class.
* @extends Singleton
*/
class Router extends Singleton {
  _express = null;
  _router = null;

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

  get Router() {
    return this._router;
  }

  @endpoint
  post(...args) {
    this._router.post.apply(this._router, args);
  }

  @endpoint
  put(...args) {
    this._router.put.apply(this._router, args);
  }

  @endpoint
  get(...args) {
    this._router.get.apply(this._router, args);
  }

  @endpoint
  delete(...args) {
    this._router.delete.apply(this._router, args);
  }
}

module.exports = Router;
