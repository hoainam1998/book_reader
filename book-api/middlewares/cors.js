const { METHOD } = require('#constants');
const RoutePath = require('#services/route-paths/route-paths');

const whitelist = [process.env.ORIGIN_CORS, process.env.CLIENT_ORIGIN_CORS];
const corsOptions = {
  methods: [METHOD.GET, METHOD.PUT, METHOD.POST, METHOD.DELETE],
  credentials: true,
  exposedHeaders: ['set-cookie'],
};

/**
 * Return origin list for specific url.
 *
 * @param {string} originUrl - The origin url.
 * @returns {string[]} - The origin list.
 */
const findOrigins = (originUrl) => {
  const iterator = RoutePath.WhiteList.keys();
  let done;
  let origins = [];

  do {
    const step = iterator.next();
    done = step.done;
    if (step.value.test(originUrl)) {
      origins = RoutePath.WhiteList.get(step.value);
    }

    if (done === false) {
      break;
    }
  } while (done !== false || origins.length === 0)
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
  let corsOptionOrigin = { origin: false };
  if (whitelist.indexOf(originUrl) !== -1) {
    const origins = findOrigins(req.originalUrl);
    if (origins.includes(originUrl)) {
      corsOptionOrigin = { origin: true };
    }
  }

  corsOptionOrigin = Object.assign(corsOptionOrigin, corsOptions);
  callback(null, corsOptionOrigin);
};
