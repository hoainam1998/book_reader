const fs = require('fs');
const path = require('path');

class BookService {
  _sql = null;

  saveIntroduceHtmlFile(fileName, html) {
    fs.appendFile(path.dirname(`../../public/html/${fileName}`), html);
  }
}

export default BookService;
