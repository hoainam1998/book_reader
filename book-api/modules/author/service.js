const { saveFile } = require('#utils');
const { createFolder, deleteFile } = require('#utils');
const { join } = require('path');
const Service = require('#services/prisma.js');
const AUTHOR_FILE_PATH_PATTERN = /(\\([\w\.\s+\-]+)){4}$/gm;

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

  getAuthors(authorIds, select) {
    const conditions = authorIds ? {
      where: {
        author_id: {
          in: [authorIds].flat()
        }
      }
    }: {};

    return this.PrismaInstance.author.findMany({
      select,
      ...conditions
    });
  }

  getAuthorDetail(authorId, select) {
    return this.PrismaInstance.author.findUnique({
      where: {
        author_id: authorId
      },
      select
    });
  }

  deleteStoryFile(authorId) {
    return this.PrismaInstance.author.findUnique({
      where: {
        author_id: authorId
      },
      select: {
        story: true
      }
    }).then(author => {
      if (author) {
        const storyFile = author.story.split(', ');
        const htmlFilePath = join(__dirname, `../../public/${storyFile[0].trim()}`);
        const jsonFilePath = join(__dirname, `../../public/${storyFile[1].trim()}`);
        return Promise.all([deleteFile(htmlFilePath), deleteFile(jsonFilePath)]);
      }
      return author;
    });
  }

  updateAuthor(author) {
    const filePath = (extName) => `${join(__dirname, `../../public/${extName}/author/${author.authorId}`)}/${author.name}.${extName}`;
    const htmlSave = saveFile(filePath('html'), author.story.html);
    const jsonSave = saveFile(filePath('json'), author.story.json);

    return Promise.all([htmlSave, jsonSave]).then((paths) => {
      const story = paths.reduce((listPath, currentPath) => {
        const relativePath = currentPath.match(AUTHOR_FILE_PATH_PATTERN)[0];
        if (relativePath) {
          listPath.push(relativePath.replace(/\\/gm, '/'));
        }
        return listPath;
      }, []).join(', ');

      return this.PrismaInstance.author.update({
        where: {
          author_id: author.authorId
        },
        data: {
          name: author.name,
          sex: author.sex === 1,
          avatar: author.avatar,
          year_of_birth: author.yearOfBirth,
          year_of_dead: author.yearOfDead,
          story
        },
      });
    });
  }

  createAuthor(author) {
    const filePath = (extName, path) => `${path}/${author.name}.${extName}`;

    return Promise.all([
      createFolder(join(__dirname, `../../public/html/author/${author.authorId}`)),
      createFolder(join(__dirname, `../../public/json/author/${author.authorId}`))
    ]).then((urls) => {
      const extNames = ['html', 'json'];

      const promise = urls.map((url, index) => {
        const extName = extNames[index];
        return saveFile(filePath(extName, url), author.story[extName]);
      });

      return Promise.all(promise).then((paths) => {
        const story = paths.reduce((listPath, currentPath) => {
          const relativePath = currentPath.match(AUTHOR_FILE_PATH_PATTERN)[0];
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
