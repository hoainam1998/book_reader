const fs = require("fs");
const { join } = require("path");

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
        fs.writeFile(
          join(__dirname, `../../public/${filePath}`),
          content,
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(filePath);
            }
          }
        );
      });
    };
    return Promise.all([saveFile('html', html), saveFile('json', json)]).then(
      (result) => {
        const introduceFilePath = result.join(",");
        return this._sql.query(
          'UPDATE BOOK SET INTRODUCE_FILE = ? WHERE BOOK_ID = ?',
          [introduceFilePath, bookId]
        );
      }
    );
  }

  saveBookInfo(book) {
    const { name, pdf, publishedTime, publishedDay, categoryId, bookId } = book;
    return this._sql.query(
      'INSERT INTO BOOK(BOOK_ID, NAME, PDF, PUBLISHED_DAY, PUBLISHED_TIME, CATEGORY_ID) VALUES (?)',
      [[bookId, name, pdf, publishedDay, publishedTime, categoryId]]
    );
  }

  saveBookAvatar(avatar, bookId) {
    return this._sql.query('UPDATE BOOK SET AVATAR = ? WHERE BOOK_ID = ?', [avatar, bookId]);
  };

  saveBookImages(images, bookId, name) {
    const imagesRecord = images.reduce((arr, image, index) => {
      arr.push([bookId, image, name[index]]);
      return arr;
    }, []);
    return this._sql.query(
      'INSERT INTO BOOK_IMAGE(BOOK_ID, IMAGE, NAME) VALUES ?',
      [imagesRecord]
    );
  }

  deletePdfFile(bookId, pdf) {
    return this._sql
      .query('SELECT PDF as pdf FROM BOOK WHERE BOOK_ID = ?', [bookId])
      .then((result) => {
        if (result.length > 0) {
          const filePdfPath = result[0].pdf;
          const filePath = join(__dirname, `../../public/${filePdfPath}`);
          if (pdf !== filePdfPath) {
            try {
              fs.unlinkSync(filePath);
              return true;
            } catch (err) {
              throw err;
            }
          }
          return true;
        } else {
          throw new Error('Can not found pdf file!');
        }
      });
  }

  deleteIntroduceFile(bookId) {
    return this._sql
      .query(
        'SELECT INTRODUCE_FILE as introduce_file FROM BOOK WHERE BOOK_ID = ?',
        [bookId]
      )
      .then((result) => {
        if (result.length > 0 && result[0].introduce_file) {
          const filePath = result[0].introduce_file.split(",");
          const htmlFilePath = filePath[0];
          const jsonFilePath = filePath[1];
          const deleteFile = (filePath) => {
            return new Promise((resolve, reject) => {
              fs.unlink(join(__dirname, `../../public/${filePath}`), (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              });
            });
          };
          return Promise.all([deleteFile(htmlFilePath), deleteFile(jsonFilePath)]);
        }
        return true;
      });
  }

  deleteImages(bookId) {
    return this._sql.query('DELETE FROM BOOK_IMAGE WHERE BOOK_ID = ?', bookId);
  }

  updateBookInfo(book) {
    const { name, pdf, publishedTime, publishedDay, categoryId, bookId } = book;
    return this._sql.query(
      'UPDATE BOOK SET NAME = ?, PDF = ?, PUBLISHED_TIME = ?, PUBLISHED_DAY = ?, CATEGORY_ID = ? WHERE BOOK_ID = ?',
      [name, pdf, publishedTime, publishedDay, categoryId, bookId]
    );
  }

  getBookDetail(bookId) {
    return this._sql.query(
      `SELECT name, pdf, PUBLISHED_TIME AS publishedTime, PUBLISHED_DAY AS publishedDay, CATEGORY_ID AS categoryId, INTRODUCE_FILE AS introduce, AVATAR AS avatar FROM BOOK WHERE BOOK_ID = ?;
      SELECT image, name FROM BOOK_IMAGE WHERE BOOK_ID = ?;`,
      [bookId, bookId]
    );
  }

  getAllName() {
    return this._sql.query('SELECT NAME AS name FROM BOOK');
  }
}

module.exports = BookService;
