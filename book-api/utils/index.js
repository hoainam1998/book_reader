/**
 * Return freezed object.
 *
 * @param {object} object - constant object.
 * @returns {object} - freezed object.
 */
const deepFreeze = (object) => {
  for (const key in object) {
    if (object[key] instanceof Object) {
      object[key] = deepFreeze(object[key]);
    };
  }
  return Object.freeze(object);
};

/**
 * Return message response object.
 *
 * @param {string} message - message.
 * @returns {object} - message object.
 */
const messageCreator = (message) => ({ message });

/**
 * Handle multiple promise by order.
 *
 * @param {Promise[]} promiseChain - list promise sorted by call order.
 * @param {Function} success - callback for then promise.
 * @param {Function} error - callback for catch promise.
 */
const promiseAllSettledOrder = (promiseChain, success, error) => {
  const promises = [];
  const handlePromise = (index = 0) => {
    if (index < promiseChain.length) {
      promises.push(
        promiseChain[index]()
          .catch((err) => err)
          .finally(() => handlePromise(index + 1))
      );
    } else {
      Promise.all(promises).then((results) => {
        const messages = results.reduce((message, result) => {
          if (result instanceof Error) {
            message += result.message + '; ';
          }
          return message;
        }, '').trim();

        if (messages) {
          throw new Error(messages);
        } else {
          success(results);
        }
      }).catch(error);
    }
  };
  handlePromise();
};

module.exports = {
  deepFreeze,
  messageCreator,
  promiseAllSettledOrder
};
