const NodeEnvironment = require('jest-environment-node').TestEnvironment;

/**
 * jest environment class.
 * @class
 * @extends NodeEnvironment
 */
class JestEnvironment extends NodeEnvironment {
  /**
   * Create jest environment.
   *
   * @constructs
   * @param {Object} config - The jest config.
   * @param {Object} context - The jest context.
   */
  constructor(config, context) {
    super(config, context);
    this.testPath = context.testPath;
  }

  /**
   * Run when setup test file.
   *
   * @async
   */
  async setup() {
    await super.setup();
    // get name of test suite by test path.
    const [name] = this.testPath.match(/(\w|-)+(?=.test.js)/);
    // assign name for global. This name using named for server test by each test suite.
    this.global.name = name ? name.replace('-', ' ') : '';
  }
}

module.exports = JestEnvironment;
