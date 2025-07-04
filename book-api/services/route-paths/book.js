const RoutePath = require('./route-paths');
const { PATH } = require('#constants');

const createRoutePath = RoutePath.Base({ baseUrl: PATH.BOOK });

/**
 * Storage book route path.
 * @class
 */
class BookRoutePath {
  /**
  * Relative: /detail *Absolute: book/detail
  */
  static detail = createRoutePath({ url: 'detail' }, [process.env.ORIGIN_CORS, process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /detail *Absolute: book/detail
  */
  static createBook = createRoutePath({ url: 'create-book' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /save-book-info *Absolute: book/save-book-info
  */
  static saveBookInfo = createRoutePath({ url: 'save-book-info' }, []);

  /**
  * Relative: /save-pdf *Absolute: book/save-pdf
  */
  static savePdf = createRoutePath({ url: 'save-pdf' }, []);

  /**
  * Relative: /save-pdf *Absolute: book/save-book-authors
  */
  static saveBookAuthors = createRoutePath({ url: 'save-book-authors' }, []);

  /**
  * Relative: /all *Absolute: book/all
  */
  static all = createRoutePath({ url: 'all' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /update-book *Absolute: book/update-book
  */
  static updateBook = createRoutePath({ url: 'update-book' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /update-pdf *Absolute: book/update-pdf
  */
  static updatePdf = createRoutePath({ url: 'update-pdf' }, []);

  /**
  * Relative: /update-book-info *Absolute: book/update-book-info
  */
  static updateBookInfo = createRoutePath({ url: 'update-book-info' }, []);

  /**
  * Relative: /pagination *Absolute: book/pagination
  */
  static pagination = createRoutePath({ url: 'pagination' }, [process.env.ORIGIN_CORS, process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /save-introduce *Absolute: book/save-introduce
  */
  static saveIntroduce = createRoutePath({ url: 'save-introduce' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /update-introduce *Absolute: book/update-introduce
  */
  static updateIntroduce = createRoutePath({ url: 'update-introduce' }, [process.env.ORIGIN_CORS]);

  /**
  * Relative: /add-favorite-book *Absolute: book/add-favorite-book
  */
  static addFavoriteBook = createRoutePath({ url: 'add-favorite-book' }, [process.env.CLIENT_ORIGIN_CORS]);

  /**
  * Relative: /delete-favorite-book/:bookId *Absolute: book/delete-favorite-book/:bookId
  */
  static deleteFavoriteBook = createRoutePath({ url: 'delete-favorite-book', subUrl: ':bookId' }, [process.env.CLIENT_ORIGIN_CORS]);
}

module.exports = BookRoutePath;
