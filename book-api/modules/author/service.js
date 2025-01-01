const { saveFile } = require('#utils');
const { createFolder } = require('#utils');
const Service = require('../service');

class AuthorService extends Service {

  createAuthor(author) {
    const filePath = (path) => `../public/${path}/author/${author.authorId}/${author.name}.${path}`;

    return Promise.all([
      createFolder(join(__dirname, `../../public/html/author/${author.authorId}`)),
      createFolder(join(__dirname, `../../public/json/author/${author.authorId}`))
    ]).then(() => {
      return Promise.all([
        saveFile(filePath('html'), author.story.html),
        saveFile(filePath('json'), author.story.json)
      ]).then((paths) => {

        const story = paths.reduce((listPath, currentPath) => {
          listPath.push(currentPath.match(/(\/([\w\.]+)){4}$/gm)[0]);
          return listPath;
        }, []).join(', ');

        return this.PrismaInstance.author.create({
          data: {
            author_id: author.authorId,
            name: author.name,
            sex: author.sex === 1,
            avatar: author.avatar,
            year_of_birth: author.yearOfBirth,
            year_of_dead: author.yearOfDead,
            story
          },
        });
      });
    });
  }
}

module.exports = AuthorService;
