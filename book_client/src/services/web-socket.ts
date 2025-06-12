/**
 * Class helping execute ws client behaviors.
 *
 * @class
 */
class WebSocketInit {
  /**
   * A websocket instance.
   *
   * @type {WebSocket}
   * @private
   * @static
   */
  private static ws?: WebSocket;

  /**
  * onOpen event.
  *
  * @param {Event} event
  * @private
  * @static
  */
  private static _onOpenCallback?: (event: Event) => void;

  /**
   * onMessage event.
   *
   * @param {Event} event
   * @private
   * @static
   */
  private static _onMessageCallback?: (event: Event) => void;

  /**
   * Init a web socket.
   *
   * @static
   */
  static init(): void {
    WebSocketInit.ws = new WebSocket(process.env.SOCKET_URL!);

    if (WebSocketInit.Ws) {
      if (WebSocketInit._onOpenCallback) {
        WebSocketInit.Ws.onopen = WebSocketInit._onOpenCallback;
      }

      if (WebSocketInit._onMessageCallback) {
        WebSocketInit.Ws.onmessage = WebSocketInit._onMessageCallback;
      }
    }
  }

  /**
   * Return current ws.
   *
   * @static
   * @private
   */
  private static get Ws() {
    return WebSocketInit.ws;
  }

  /**
   * Set onOpen event.
   *
   * @static
   * @param {function} callback - The onOpen event.
   */
  static set onOpen(callback: (event: Event) => void) {
    WebSocketInit._onOpenCallback = callback;
  }

  /**
   * Set onMessage event.
   *
   * @static
   * @param {function} callback - The onMessage event.
   */
  static set onMessage(callback: (event: Event) => void) {
    WebSocketInit._onMessageCallback = callback;
  }
}

export default WebSocketInit;
