/**
 * Redis event pub/sub
 * @class
 */
class Event {
  _eventName;
  _payload;
  _senderId;

  /**
   * Create new RedisClient instance.
   * @constructor
   * @param {string} eventName - The event name.
   * @param {object} payload - The redis subscribe payload.
   * @param {string} senderId - The senderId.
   */
  constructor(eventName, payload, senderId) {
    this._eventName = eventName;
    this._payload = JSON.stringify(payload);
    this._senderId = senderId;
  }

  get eventName() {
    return this._eventName;
  }

  get payload() {
    return this._payload;
  }

  get senderId() {
    return this._senderId;
  }

  get plainToObject() {
    return JSON.stringify({
      payload: this.payload,
      senderId: this._senderId,
    });
  }

  /**
   * Create new event.
   * @static
   * @param {object} payload - The payload.
   * @param {string} senderId - The senderId.
   * @returns {Event} The new event.
   */
  static createEvent(payload, senderId) {
    return new Event(this.eventName, payload, senderId);
  }

  /**
   * Return message object from json.
   * @static
   * @param {string} json - The json string.
   * @returns {{
   * senderId: string,
   * payload: object
   * }} The plain message object.
   */
  static fromJson(json) {
    const messageObject = JSON.parse(json);
    const payload = JSON.parse(messageObject.payload);
    return {
      ...messageObject,
      payload,
    };
  }
}

module.exports = Event;
