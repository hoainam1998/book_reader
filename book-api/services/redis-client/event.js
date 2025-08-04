const ALL_CATEGORY_EVENT = 'All Category Event';

class Event {
  _eventName;
  _payload;

  constructor(eventName, payload) {
    this._eventName = eventName;
    this._payload = payload;
  }

  get eventName() {
    return this._eventName;
  }

  get payload() {
    return JSON.stringify(this.payload);
  }

  static createEvent(eventName, payload) {
    return new Event(eventName, payload);
  }

  static fromJson(json) {
    const { eventName, payload } = JSON.parse(json);
    return new Event(eventName, payload);
  }
}

class CategoryEvent {
  static create(payload) {
    return Event.createEvent(ALL_CATEGORY_EVENT, payload);
  }

  static from(json) {
    return Event.fromJson(json);
  }
}

module.exports = CategoryEvent;
