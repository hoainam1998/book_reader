const { WebSocket } = require('ws');
const socketUrl = `ws://${process.env.LOCALHOST}:${process.env.SOCKET_TEST_PORT}`;

/**
 * Class support create a client websocket.
 *
 * @class
 */
class WebSocketCreator {
  _ws;

  /**
   * Create an instance.
   *
   * @constructs
   */
  constructor() {
    this._ws = new WebSocket(socketUrl);
  }

  /**
   * Return a ws instance.
   *
   * @return {WebSocket} - The ws client.
   */
  get Ws() {
    return this._ws;
  }

  /**
   * The WebSocketCreator instance.
   *
   * @static
   */
  static instance;

  /**
   * This callback called when onopen websocket event trigger.
   *
   * @callback onOpenCallback
   * @param {object} event
   * @param {WebSocket} this
   */

  /**
   * Start up a client websocket.
   *
   * @static
   * @param {onOpenCallback} onOpenCallback - The function call when onopen event fire.
   * @return {Promise<WebSocketCreator>} - The promise.
   */
  static startUp(onOpenCallback) {
    return new Promise((resolve) => {
      WebSocketCreator.instance = new WebSocketCreator();
      WebSocketCreator.instance.Ws.onopen = function (event) {
        onOpenCallback(event, this);
        resolve(WebSocketCreator.instance);
      };
    });
  }

  /**
   * Close socket.
   *
   * @static
   */
  static turnDown() {
    if (WebSocketCreator.instance) {
      WebSocketCreator.instance.Ws.close();
    }
  }
}

module.exports = WebSocketCreator;
