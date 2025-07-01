const { PATH, METHOD } = require('#constants');

const whitelist = [process.env.ORIGIN_CORS, process.env.CLIENT_ORIGIN_CORS];
const corsOptions = {
  methods: [METHOD.GET, METHOD.PUT, METHOD.POST, METHOD.DELETE],
  credentials: true,
  exposedHeaders: ['set-cookie'],
};

/**
 * Cors middleware, helping separate admin and client route.
 *
 * @param {Object} req - express request.
 * @param {Function} corsFunction - cors callback.
 * @returns {void}
 */
module.exports = (req, callback) => {
  const originUrl = req.header('Origin');
  let corsOptionOrigin = { origin: false };
  if (whitelist.indexOf(originUrl) !== -1) {
    const regexUrl = new RegExp(`${PATH.CLIENT}\/.+`, 'g');
    if (originUrl === whitelist[1] && regexUrl.test(req.originalUrl)
      || originUrl === whitelist[0] && !regexUrl.test(req.originalUrl)
    ) {
      corsOptionOrigin = { origin: true };
    }
  }

  corsOptionOrigin = Object.assign(corsOptionOrigin, corsOptions);
  callback(null, corsOptionOrigin);
};
