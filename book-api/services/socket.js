const { WebSocketServer } = require('ws');
const Logger = require('#services/logger');
const logger = new Logger('web-socket');

const NORMAL_CLOSE_CODE = 1000;
const SOCKET_CLOSE = 'User was logout!';

/**
 * Web socket wrapper class. It help send message with default content.
 *
 * @class
 */
class WsClient {
  _ws;
  _name;

  /**
   * Init.
   *
   * @constructor
   * @param {object} ws - The web socket client.
   * @param {string} name - The name of client.
   */
  constructor(ws, name) {
    this._ws = ws;
    this._name = name;
  }

  /**
   * Return current ws client.
   *
   * @return {WebSocket}
   */
  get Ws() {
    return this._ws;
  }

  /**
   * Sending data.
   *
   * @param {*} data - The data sending.
   */
  send(data) {
    if (this.Ws) {
      this.Ws.send(JSON.stringify({ name: this._name, ...data }));
    }
  }
}

/**
 * Help start up, close, send socket data.
 *
 * @class
 */
class Socket {
  _ws;
  _wss;
  _clients = new Map();

  /**
   * A socket instance.
   *
   * @type {Socket}
   * @static
   */
  static instance;

  /**
   * Init.
   *
   * @constructor
   */
  constructor() {
    if (!Socket.instance && process.env.NODE_ENV !== 'test') {
      this.subscribe();
    }
  }

  /**
   * A socket instance.
   *
   * @return {WebSocket}
   */
  get Ws() {
    return this._ws;
  }

  /**
   * A socket server instance.
   *
   * @return {WebSocketServer}
   */
  get Wss() {
    return this._wss;
  }

  /**
   * Return all ws client subscribed.
   *
   * @return {Map}
   */
  get Clients() {
    return this._clients;
  }

  /**
   * A callback trigger when onmessage event fire.
   *
   * @callback onMessageCallback
   * @param {object} event
   */

  /**
   * Set onMessage event.
   *
   * @param {onMessageCallback} callback - A function call when onmessage event fire.
   */
  set onMessage(callback) {
    if (this.Ws) {
      this.Ws.onmessage = callback;
    }
  }

  /**
   * Startup socket server.
   */
  subscribe() {
    const socketPort = process.env.NODE_ENV === 'test' ? process.env.SOCKET_TEST_PORT : process.env.SOCKET_PORT;
    this._wss = new WebSocketServer({ port: socketPort });
    this._wss.on('connection', function connection(ws) {
      Socket.instance._ws = ws;
      logger.log('socket was opened!');
      ws.on('error', (error) => {
        logger.error(error);
        ws.terminate();
      });

      ws.on('message', function message(data) {
        const message = JSON.parse(data);
        if (message.isClose) {
          Socket.instance.Clients.delete(message.id);
          ws.close(NORMAL_CLOSE_CODE, SOCKET_CLOSE);
        } else {
          Socket.instance.Clients.set(message.id, new WsClient(ws, message.name));
        }
      });
    });

    this._wss.on('error', (error) => logger.error(error));
  }

  /**
   * Close web socket server.
   *
   * @static
   */
  static close() {
    if (Socket.instance) {
      Socket.instance.Wss?.close((error) => {
        if (error) {
          logger.error(error);
        } else {
          logger.log('web socket was closed!');
        }
      });
    }
  }

  /**
   * Take current socket instance.
   *
   * @static
   * @return {Socket} - The current socket instance.
   */
  static getInstance() {
    if (!Socket.instance) {
      Socket.instance = new Socket();
    }
    return Socket.instance;
  }
}

module.exports = { Socket, WsClient };
