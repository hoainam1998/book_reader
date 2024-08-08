const fs = require('fs');
const path = require('path');

class BookService {
  _sql = null;

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
}

module.exports = BookService;
