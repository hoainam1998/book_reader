const { saveFile } = require('#utils');
const { createFolder } = require('#utils');
const { join } = require('path');
const Service = require('#services/prisma.js');

class AuthorService extends Service {

  pagination(pageSize, pageNumber, keyword, select) {
    const offset = (pageNumber - 1) * pageSize;
    if (keyword) {
      return this.PrismaInstance.$transaction([
        this.PrismaInstance.author.findMany({
          take: pageSize,
          skip: offset,
          where: {
            name: {
              contains: keyword
            }
          },
          orderBy: {
            author_id: 'desc',
          },
          select
        }),
        this.PrismaInstance.author.count({
          where: {
            name: {
              contains: keyword
            }
          }
        }),
      ]);
    }
    return this.PrismaInstance.$transaction([
      this.PrismaInstance.author.findMany({
        take: pageSize,
          skip: offset,
          orderBy: {
            author_id: 'desc',
          },
          select
      }),
      this.PrismaInstance.author.count(),
    ]);
  }

  createAuthor(author) {
    const filePath = (extName, path) => `${path}/${author.name}.${extName}`;

    return Promise.all([
      createFolder(join(__dirname, `../../public/html/author/${author.authorId}`)),
      createFolder(join(__dirname, `../../public/json/author/${author.authorId}`))
    ]).then((urls) => {
      const extNames = ['html', 'json'];
      const promise = urls.map((url, index) => saveFile(filePath(extNames[index], url), author.story.html));
      return Promise.all(promise).then((paths) => {
        const story = paths.reduce((listPath, currentPath) => {
          const relativePath = currentPath.match(/(\\([\w\.]+)){4}$/gm)[0];
          if (relativePath) {
            listPath.push(relativePath.replace(/\\/gm, '/'));
          }
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
