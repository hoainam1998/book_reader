const { METHOD } = require('#constants');
const RoutePath = require('#services/route-paths/route-paths');

const whitelist = [process.env.ORIGIN_CORS, process.env.CLIENT_ORIGIN_CORS];
const corsOptions = {
  methods: [METHOD.GET, METHOD.PUT, METHOD.POST, METHOD.DELETE],
  credentials: true,
  exposedHeaders: ['set-cookie'],
};

/**
 * Return origin result.
 *
 * @param {boolean} on - The origin flag.
 * @returns {{origin: boolean}} - The origin result.
 */
const toggleOrigin = (on) => ({ origin: on });

/**
 * Return origin list for specific url.
 *
 * @param {string} originUrl - The origin url.
 * @returns {string[]} - The origin list.
 */
const findOrigins = (originUrl) => {
  const iterator = RoutePath.WhiteList.keys();
  let origins = [];

  do {
    const step = iterator.next();
    const value = step.value;

    if (value) {
      if (value.test(originUrl)) {
        origins = RoutePath.WhiteList.get(value);
      }
    } else {
      break;
    }
  } while (origins.length === 0);
  return origins;
};

/**
 * Cors middleware, helping separate admin and client route.
 *
 * @param {object} req - express request.
 * @param {Function} corsFunction - cors callback.
 * @returns {void}
 */
module.exports = (req, callback) => {
  const originUrl = req.header('Origin');
  let corsOptionOrigin = toggleOrigin(false);

  if (req.method === METHOD.OPTIONS) {
    corsOptionOrigin = toggleOrigin(true);
  } else {
    if (whitelist.indexOf(originUrl) !== -1) {
      const origins = findOrigins(req.originalUrl);

      if (origins.includes(originUrl)) {
        corsOptionOrigin = toggleOrigin(true);
      } else {
        corsOptionOrigin = toggleOrigin(false);
      }
    }
  }

  callback(null, Object.assign(corsOptionOrigin, corsOptions));
};
