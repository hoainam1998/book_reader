/**
 * Parsing current date to format [yyyy-mm-dd hh-mm-ss (PM: AM)].
 *
 * @return {string} - The string present time matching with format.
 */
const formatTimestamps = () => {
  const date = new Date();
  const time = date.toLocaleTimeString();
  const day = date.toLocaleDateString().replace(/\//gm, '-');
  return `${day} ${time}`;
};

/**
 * Class supported logging feature.
 * @class
 */
class Logger {
  /**
   * Create logger service class.
   *
   * @param {string} name - The name of context.
   */
  constructor(name) {
    this._name = name;
  }

  /**
   * Private function writing message.
   *
   * @param {string} level - The kind of console (ex: log, warn, log, error).
   * @param {string} message - The message to logging.
   */
  _write(level, message) {
    console[level](`${this._name} - [${formatTimestamps()}] - ${message}`);
  }

  /**
   * Static function writing message.
   * @static
   * @param {string} context - The context name.
   * @param {string} level - The kind of console (ex: log, warn, log, error).
   * @param {string} message - The message to logging.
   */
  static _writeWithContext(context, level, message) {
    console[level](`${context} - [${formatTimestamps()}] - ${message}`);
  }

  /**
   * Writing error log.
   * @param {string} message - The message to logging.
   */
  error(message) {
    this._write(this.error.name, message);
  }

  /**
   * Writing info log.
   * @param {string} message - The message to logging.
   */
  log(message) {
    this._write(this.log.name, message);
  }

  /**
   * Writing warn log.
   * @param {string} message - The message to logging.
   */
  warn(message) {
    this._write(this.warn.name, message);
  }

  /**
   * Writing error log according by context name.
   * @static
   * @param {string} context - The context name.
   * @param {string} message - The message to logging.
   */
  static error(context, message) {
    Logger._writeWithContext(context, Logger.error.name, message);
  }

  /**
   * Writing info log according by context name.
   * @static
   * @param {string} context - The context name.
   * @param {string} message - The message to logging.
   */
  static log(context, message) {
    Logger._writeWithContext(context, Logger.log.name, message);
  }

  /**
   * Writing warn log according by context name.
   * @static
   * @param {string} context - The context name.
   * @param {string} message - The message to logging.
   */
  static warn(context, message) {
    Logger._writeWithContext(context, Logger.warn.name, message);
  }
}

module.exports = Logger;
