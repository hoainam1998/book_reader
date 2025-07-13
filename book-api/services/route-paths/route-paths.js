/**
 * Storage all route path.
 * @class
 */
class RoutePath {
  static whiteList = new Map();
  _baseUrl;
  _url;
  _subUrl = '';
  _origin;

  /**
   * Create route path instance.
   *
   * @constructor
   * @param {{
   * baseUrl: string;
   * url: string;
   * subUrl: string
   * }} - The url object.
   * @param {string[]} origin - The origin list.
   */
  constructor({ baseUrl, url, subUrl }, origin) {
    this._baseUrl = baseUrl;
    this._url = url;
    this._subUrl = subUrl || '';
    this._origin = origin;
    RoutePath.WhiteList.set(new RegExp(`${this.abs}(\\/.+)?`), origin);
  }

  /**
   * Return the origin list.
   * @returns {string[]}
   */
  get Origin() {
    return this._origin;
  }

  /**
   * Return absolute path.
   * @returns {string}
   */
  get abs() {
    return `${this._baseUrl}/${this._url}`;
  }

  /**
   * Return relative path.
   * @returns {string}
   */
  get rel() {
    return `/${this._url}/${this._subUrl}`;
  }

  /**
   * Return all origin.
   * @static
   * @returns {Map<RegExp, string[]>}
   */
  static get WhiteList() {
    return this.whiteList;
  }

  /**
   * Return create route path instance function.
   * @static
   * @param {{ baseUrl: string }} baseUrlObject - The base url.
   * @returns {(remainUrlObject: {url: string, subUrl: string}, origins: string[]) => RoutePath} - The callback function return a route path instance.
   */
  static Base(baseUrlObject) {
    return (remainUrlObject, origins) => new RoutePath({ ...baseUrlObject, ...remainUrlObject }, origins);
  }

  [Symbol.toPrimitive]() {
    return this.rel;
  }
}

module.exports = RoutePath;
