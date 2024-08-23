const fs = require('fs');
const path = require('path');

class BookService {
  _sql = null;

  constructor(sql) {
    this._sql = sql;
  }

  saveIntroduceHtmlFile(fileName, html) {
    const fileNameSaved = fileName.replace(/\s/, '-');
    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(__dirname, `../../public/html/${fileNameSaved}.html`), html, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  saveBookInfo(book) {
    const { name, pdf, publishedTime, publishedDay, categoryId, bookId } = book;
    return this._sql.query('INSERT INTO BOOK(BOOK_ID, NAME, PDF, PUBLISHED_DAY, PUBLISHED_TIME, CATEGORY_ID) VALUES (?)',
      [[bookId, name, pdf, publishedDay, publishedTime, categoryId]]);
  }

  saveBookImages(images, bookId, name) {
    const imagesRecord = images.reduce((arr, image, index) => {
      arr.push([bookId, image, name[index]]);
      return arr;
    }, []);
    return this._sql.query('INSERT INTO BOOK_IMAGE(BOOK_ID, IMAGE, NAME) VALUES ?', [imagesRecord]);
  }

  getBookDetail(bookId) {
    return this._sql.query(
      `SELECT name, pdf, PUBLISHED_TIME AS publishedTime, PUBLISHED_DAY AS publishedDay, CATEGORY_ID AS categoryId, INTRODUCE_FILE as introduce FROM BOOK WHERE BOOK_ID = ?;
      SELECT image, name FROM BOOK_IMAGE WHERE BOOK_ID = ?;`,
      [bookId, bookId]
    );
  }
}

module.exports = BookService;
