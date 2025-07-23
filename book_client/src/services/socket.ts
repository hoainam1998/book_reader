import { customError } from 'utils';
import { SOCKET_NAME } from 'enums';

/**
 * Web socket service.
 *
 * @class
 */
class Socket {
  protected messageCallback?: (data: any) => void;
  private static sockets = new Map<string, Socket>();

  /**
  * Web socket service.
  *
  * @constructor
  * @param {string} name - A client name.
  */
  constructor(name: string) {
    if (!Socket.sockets.has(name)) {
      Socket.sockets.set(name, this);
    }
  }

  /**
  * Regis on message event.
  *
  * @param {function} callback - On message event.
  */
  messageController(callback: (data: any) => void): void {
    this.messageCallback = callback;
  }

  /**
  * OnMessage event.
  *
  * @param {*} data - The received data.
  */
  onMessage(data: any): void {
    if (this.messageCallback) {
      this.messageCallback(data);
    }
  }

  /**
  * Get ws client by name.
  *
  * @param {string} name - The client name.
  * @return {Socket} - The ws client.
  * @throws {Error} - Throw error when ws not exist.
  */
  static getInstance(name: string): Socket | undefined {
    if (Socket.sockets.has(name)) {
      return Socket.sockets.get(name);
    }
    throw customError(`Can not get socket instance with name: ${name}`);
  }

  /**
  * Create list of instance by names.
  *
  * @param {...string} names - The array of names.
  */
  static createInstances(...names: string[]): void {
    names.forEach((name: string) => new Socket(name));
  }
};

Socket.createInstances(SOCKET_NAME.USER, SOCKET_NAME.CLIENT);

export default Socket;
