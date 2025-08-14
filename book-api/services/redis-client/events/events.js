const Event = require('./event');

class UpdateFavoriteBooksEvent extends Event {
  static eventName = 'UpdateFavoriteBooks';
}

class UpdateReadLateBooksEvent extends Event {
  static eventName = 'UpdateReadLateBooks';
}

class UpdateUsedReadBooksEvent extends Event {
  static eventName = 'UpdateUsedReadBooksEvent';
}

module.exports = {
  UpdateFavoriteBooksEvent,
  UpdateReadLateBooksEvent,
  UpdateUsedReadBooksEvent,
};
