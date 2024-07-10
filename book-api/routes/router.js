class Router {
  _express = null;
  _router = null;
  _schema = null;

  constructor(express, schema) {
    this._express = express;
    this._schema = schema;
    this._router = express.Router();
  }

  post(path, handle) {
    this._router.post(path, (req, res, next) => handle(req, res, next, this._schema));
  }
}

module.exports = Router;
