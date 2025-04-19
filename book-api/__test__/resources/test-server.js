const request = require('supertest');
const { createServer } = require('http');
const app = require('#app');
const Logger = require('#services/logger');

/**
 * Class support working with test server.
 * @class
 */
class TestServer {
  _api;
  _server;

  /**
  * Test server instance
  * @static
  */
  static testServerInstance = new TestServer();

  /**
  * Create test server instance.
  * @constructs
  */
  constructor() {
    if (!TestServer.testServerInstance) {
      // create server express from nodejs http.
      this._server = createServer(app);
      // wrap new server by supertest.
      this._api = request(this._server);
    }
  }

  /**
  * Private method helping to add middleware.
  *
  * @private
  * @param {Function} middleware - The middleware.
  */
  _addMiddleware(middleware) {
    this._server.on('request', middleware);
  }

  /**
  * Private method helping to remove middleware.
  *
  * @private
  */
  _removeTestMiddleware() {
    this._server.removeAllListeners();
  }

  /**
  * Adding middleware to support test.
  *
  * @static
  * @param {Function} middleware - The middleware.
  */
  static addMiddleware(middleware) {
    TestServer.testServerInstance._addMiddleware(middleware);
  }

  /**
  * Remove middleware added to support test.
  *
  * @static
  */
  static removeTestMiddleware() {
    TestServer.testServerInstance._removeTestMiddleware();
  }

  /**
  * Start a test server.
  *
  * @static
  * @param {Function} done - The done call back from jest lifecycle hook.
  * @param {string} serverName - The name of test server.
  * @return {Object} - The test server.
  */
  static startTestServer(done, serverName) {
    TestServer.testServerInstance._server.listen(done);
    Logger.log('Start test server!', `Start test server for ${serverName}`);
    return TestServer.testServerInstance._api;
  }

  /**
  * Close a test server.
  *
  * @static
  * @param {Function} done - The done call back from jest lifecycle hook.
  * @param {string} serverName - The name of test server.
  */
  static closeTestServer(done, serverName) {
    TestServer.testServerInstance._server.close(() => {
      Logger.log('Close test server!', `Test server closed for ${serverName}`);
      done();
    });
  }
}

module.exports = TestServer;
