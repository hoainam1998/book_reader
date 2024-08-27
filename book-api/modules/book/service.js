const fs = require('fs');
const { join } = require('path');

class BookService {
  _sql = null;

  constructor(sql) {
    this._sql = sql;
  }

  saveIntroduceHtmlFile(fileName, html, json, bookId) {
    const fileNameSaved = fileName.replace(/\s/, '-');
    const saveFile = (path, content) => {
      const filePath = `${path}/${fileNameSaved}.${path}`;
      return new Promise((resolve, reject) => {
        fs.writeFile(join(__dirname, `../../public/${filePath}`), content, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(filePath);
          }
        });
      });
    };
    return Promise.all([
      saveFile('html', html),
      saveFile('json', json)
    ]).then(result => {
      const introduceFilePath = result.join(',');
      return this._sql.query('UPDATE BOOK SET INTRODUCE_FILE = ? WHERE BOOK_ID = ?', [introduceFilePath, bookId]);
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
