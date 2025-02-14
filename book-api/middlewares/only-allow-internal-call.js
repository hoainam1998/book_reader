const cors = require('cors');

/**
 * Cors middleware only allow calling to internal api.
 *
 * @param {Object} req - express request.
 * @param {Function} corsFunction - express response.
 * @returns {void}
 */
const corsOptionsDelegate = (req, callback) => {
  const corsOptions = {
    origin: `${req.protocol}://${req.get('host')}`,
  };
  callback(null, corsOptions);
};

module.exports = cors(corsOptionsDelegate);
