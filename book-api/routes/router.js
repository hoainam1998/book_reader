const { messageCreator } = require('#utils');
const { HTTP_CODE } = require('#constants');

class Router {
  _express = null;
  _router = null;
  _schema = null;

  constructor(express, schema) {
    this._express = express;
    this._schema = schema;
    this._router = express.Router();
    this._router.post('*', (_, res, next) => {
      if (this._schema) {
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

  post(...args) {
    const path = args[0];
    if (args.length === 4) {
      const helper1 = args[1];
      const helper2 = args[2];
      const handle = args[3];
      this._router.post(path, helper1, helper2, (req, res, next) => handle(req, res, next, this._schema));
    } else if (args.length === 3) {
      const helper = args[1];
      const handle = args[2];
      this._router.post(path, helper, (req, res, next) => handle(req, res, next, this._schema));
    } else {
      const handle = args[1];
      this._router.post(path, (req, res, next) => handle(req, res, next, this._schema));
    }
  }
}

module.exports = Router;
