const { saveFile } = require('#utils');
const { mkdir } = require('fs/promises');
const { join } = require('path');

class AuthorService {
  _sql;

  constructor(sql) {
    this._sql = sql;
  }

  createAuthor(author) {
    const filePath = (path) => `../public/${path}/author/${author.authorId}/${author.name}.${path}`;
    const createFolder = (path) => {
      return mkdir(join(__dirname, `../../public/${path}/author/${author.authorId}`), { recursive: true });
    };

    return Promise.all([
      createFolder('html'),
      createFolder('json')
    ]).then(() => {
      return Promise.all([
        saveFile(filePath('html'), author.story.html),
        saveFile(filePath('json'), author.story.json)
      ]).then((paths) => {

        const story = paths.reduce((listPath, currentPath) => {
          listPath.push(currentPath.match(/(\/([\w\.]+)){4}$/gm)[0]);
          return listPath;
        }, []).join(', ');

        return this._sql.query('INSERT INTO AUTHOR VALUES(?)', [
          [
            author.authorId,
            author.name,
            author.sex,
            author.avatar,
            author.yearOfBirth,
            author.yearOfDead,
            story
          ]
        ]);
      });
    });
  }
}

module.exports = AuthorService;
