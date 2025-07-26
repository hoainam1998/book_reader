const { GraphQLError } = require('graphql');
const { createFolder, deleteFile, checkArrayHaveValues, calcPages, saveFile } = require('#utils');
const Service = require('#services/prisma');
const { graphqlNotFoundErrorOption } = require('../common-schema');
const { AUTHOR } = require('#messages');
const { PUBLIC_PATH } = require('#constants');
// eslint-disable-next-line no-useless-escape
const AUTHOR_FILE_PATH_PATTERN = /(\\([\w\.\s+\-]+)){4}$/gm;

class AuthorService extends Service {
  pagination(pageSize, pageNumber, keyword, select) {
    const offset = (pageNumber - 1) * pageSize;
    let paginationPromiseResult;

    if (keyword) {
      paginationPromiseResult = this.PrismaInstance.$transaction([
        this.PrismaInstance.author.findMany({
          take: pageSize,
          skip: offset,
          where: {
            name: {
              contains: keyword,
            },
          },
          orderBy: {
            author_id: 'desc',
          },
          select: {
            ...select,
            _count: {
              select: {
                book_author: true,
              },
            },
          },
        }),
        this.PrismaInstance.author.count({
          where: {
            name: {
              contains: keyword,
            },
          },
        }),
      ]);
    } else {
      paginationPromiseResult = this.PrismaInstance.$transaction([
        this.PrismaInstance.author.findMany({
          take: pageSize,
          skip: offset,
          orderBy: {
            author_id: 'desc',
          },
          select: {
            ...select,
            _count: {
              select: {
                book_author: true,
              },
            },
          },
        }),
        this.PrismaInstance.author.count(),
      ]);
    }

    return paginationPromiseResult.then((authors) => {
      const total = authors[1];
      const pages = calcPages(pageSize, total);
      if (!checkArrayHaveValues(authors[0])) {
        const response = {
          list: [],
          total: 0,
          page: pageNumber,
          pages,
          pageSize,
        };
        graphqlNotFoundErrorOption.response = response;
        throw new GraphQLError(AUTHOR.AUTHORS_EMPTY, graphqlNotFoundErrorOption);
      }
      authors.push(pages);
      return authors;
    });
  }

  getAuthors(authorIds, select) {
    const conditions = authorIds
      ? {
          where: {
            author_id: {
              in: [authorIds].flat(),
            },
          },
        }
      : {};

    return this.PrismaInstance.author.findMany({
      select,
      ...conditions,
    });
  }

  loadAuthorMenu(select) {
    return this.PrismaInstance.author.findMany({
      select,
      where: {
        book_author: {
          some: {},
        },
      },
    });
  }

  getAuthorDetail(authorId, select) {
    return this.PrismaInstance.author.findUniqueOrThrow({
      where: {
        author_id: authorId,
      },
      select,
    });
  }

  deleteStoryFile(authorId) {
    return this.getAuthorDetail(authorId, {
      story: true,
    }).then((author) => {
      const storyFile = author.story.split(',');
      const htmlFilePath = `${PUBLIC_PATH}${storyFile[0].trim()}`;
      const jsonFilePath = `${PUBLIC_PATH}${storyFile[1].trim()}`;
      return Promise.all([deleteFile(htmlFilePath), deleteFile(jsonFilePath)]);
    });
  }

  updateAuthor(author) {
    const filePath = (extName) => `${PUBLIC_PATH}/${extName}/author/${author.authorId}/${author.name}.${extName}`;
    const htmlSave = saveFile(filePath('html'), author.story.html);
    const jsonSave = saveFile(filePath('json'), author.story.json);

    return Promise.all([htmlSave, jsonSave]).then((paths) => {
      const story = paths
        .reduce((listPath, currentPath) => {
          const relativePath = currentPath.match(AUTHOR_FILE_PATH_PATTERN)[0];
          if (relativePath) {
            listPath.push(relativePath.replace(/\\/gm, '/'));
          }
          return listPath;
        }, [])
        .join(', ');

      return this.PrismaInstance.author.update({
        where: {
          author_id: author.authorId,
        },
        data: {
          name: author.name,
          sex: author.sex,
          avatar: author.avatar,
          year_of_birth: author.yearOfBirth,
          year_of_dead: author.yearOfDead,
          story,
        },
      });
    });
  }

  createAuthor(author) {
    const filePath = (extName, path) => `${path}/${author.name}.${extName}`;
    const authorId = Date.now().toString();

    return Promise.all([
      createFolder(`${PUBLIC_PATH}/html/author/${authorId}`),
      createFolder(`${PUBLIC_PATH}/json/author/${authorId}`),
    ]).then((urls) => {
      const extNames = ['html', 'json'];

      const promise = urls.map((url, index) => {
        const extName = extNames[index];
        return saveFile(filePath(extName, url), author.story[extName]);
      });

      return Promise.all(promise).then((paths) => {
        const story = paths
          .reduce((listPath, currentPath) => {
            const relativePath = currentPath.match(AUTHOR_FILE_PATH_PATTERN)[0];
            if (relativePath) {
              listPath.push(relativePath.replace(/\\/gm, '/'));
            }
            return listPath;
          }, [])
          .join(', ');

        return this.PrismaInstance.author.create({
          data: {
            author_id: authorId,
            name: author.name,
            sex: author.sex,
            avatar: author.avatar,
            year_of_birth: author.yearOfBirth,
            year_of_dead: author.yearOfDead,
            story,
          },
        });
      });
    });
  }
}

module.exports = AuthorService;
