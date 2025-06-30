const { join } = require('path');
const { saveFile, deleteFile, calcPages } = require('#utils');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');
const Service = require('#services/prisma');
const { BOOK } = require('#messages');

class BookService extends Service {

  saveIntroduceHtmlFile(fileName, html, json, bookId) {
    const fileNameSaved = fileName.replace(/\s/, '-');
    const filePath = (filePath) => join(__dirname, `../../public/${filePath}/${fileNameSaved}.${filePath}`);

    return Promise.all([
      saveFile(filePath('html'), html),
      saveFile(filePath('json'), json)
    ])
    .then(
      () => {
        const introduceFilePath = `html/${fileNameSaved}.html,json/${fileNameSaved}.json`;
        return this.PrismaInstance.book.update({
          where: {
            book_id: bookId,
          },
          data: {
            introduce_file: introduceFilePath
          },
        });
      }
    );
  }

  saveBookInfo(book) {
    const { name, avatar, publishedTime, publishedDay, images, categoryId, bookId } = book;

    return this.PrismaInstance.book.create({
      data: {
        book_id: bookId,
        name,
        avatar,
        published_day: publishedDay,
        published_time: publishedTime,
        category_id: categoryId,
        book_image: {
          create: images
        },
      },
    });
  }

  savePdfFile(bookId, pdf) {
    return this.PrismaInstance.book.update({
      where: {
        book_id: bookId
      },
      data: {
        pdf
      }
    });
  }

  deletePdfFile(bookId, name) {
    return this.PrismaInstance.book.findUniqueOrThrow({
      where: {
        book_id: bookId
      },
      select: {
        pdf: true
      },
    })
    .then((result) => {
      const oldPdfFile = `pdf/${name}.pdf`
      if (result.pdf !== oldPdfFile) {
        const filePath = join(__dirname, `../../public/${result.pdf}`);
        return deleteFile(filePath);
      }
    });
  }

  deleteIntroduceFile(bookId) {
    return this.PrismaInstance.book.findUniqueOrThrow({
      where: {
        book_id: bookId
      },
      select: {
        introduce_file: true,
      },
    })
    .then((result) => {
      if (result && result.introduce_file) {
        const filePath = result.introduce_file.split(',');
        const htmlFilePath = join(__dirname, `../../public/${filePath[0].trim()}`);
        const jsonFilePath = join(__dirname, `../../public/${filePath[1].trim()}`);
        return Promise.all([deleteFile(htmlFilePath), deleteFile(jsonFilePath)]);
      }
      throw new PrismaClientKnownRequestError(BOOK.INTRODUCE_FILE_NOT_FOUND, { code: 'P2025' });
    });
  }

  deleteImages(bookId) {
    return this.PrismaInstance.book.delete({
      where: {
        book_id: bookId
      },
    });
  }

  updateBookInfo(book) {
    const { name, avatar, publishedTime, publishedDay, categoryId, bookId } = book;
    return this.PrismaInstance.book.update({
      where: {
        book_id: bookId
      },
      data: {
        name,
        avatar,
        published_time: publishedTime,
        published_day: publishedDay,
        category_id: categoryId,
      },
    })
    .then(() => {
      return this.PrismaInstance.book_image.deleteMany({
        where: {
          book_id: bookId
        }
      })
      .then(() => {
        return this.PrismaInstance.book_image.createMany({
          data: book.images.map(img => ({ ...img, book_id: bookId }))
        });
      });
    });
  }

  getBookDetail(bookId, select) {
    return this.PrismaInstance.book.findUniqueOrThrow({
      where: {
        book_id: bookId
      },
      select
    }).then((result) => {
      return {
        ...result,
        category: {
          ...result.category,
          categoryId: result.category.category_id
        }
      };
    })
  }

  getAllBooks(select) {
    return this.PrismaInstance.book.findMany({
      select
    });
  }

  pagination(pageSize, pageNumber, keyword, by, select) {
    let searchByForeignId = {};

    if (by) {
      if (by.authorId) {
        searchByForeignId = {
          book_author: {
            some: {
              author_id: by.authorId,
            }
          },
        };
      } else {
        searchByForeignId = {
          category_id: by.categoryId,
        };
      }
    }

    const offset = (pageNumber - 1) * pageSize;
    let promiseResult;
    if (keyword) {
      promiseResult = this.PrismaInstance.$transaction([
        this.PrismaInstance.book.findMany({
          take: pageSize,
          skip: offset,
          where: {
            name: {
              contains: keyword
            },
            ...searchByForeignId,
          },
          orderBy: {
            book_id: 'desc',
          },
          select,
        }),
        this.PrismaInstance.book.count({
          where: {
            name: {
              contains: keyword
            },
            ...searchByForeignId,
          }
        }),
      ]);
    } else {
      promiseResult = this.PrismaInstance.$transaction([
        this.PrismaInstance.book.findMany({
          where: searchByForeignId,
          take: pageSize,
            skip: offset,
            orderBy: {
              book_id: 'desc',
            },
            select,
        }),
        this.PrismaInstance.book.count({
          where: searchByForeignId,
        }),
      ]);
    }

    return promiseResult.then((results) => {
      const total = results[1];
      const pages = calcPages(pageSize, total);
      results.push(pages);
      return results;
    });
  }

  saveBookAuthor(authors) {
    return this.PrismaInstance.book_author.createMany({
      data: authors
    });
  }

  deleteBookAuthor(bookId) {
    return this.PrismaInstance.book_author.deleteMany({
      where: {
        book_id: bookId
      }
    });
  }

  addFavoriteBook(readerId, bookId) {
    return this.PrismaInstance.favorite_books.create({
      data: {
        book_id: bookId,
        reader_id: readerId
      },
    });
  }

  deleteFavoriteBook(readerId, bookId) {
    return this.PrismaInstance.favorite_books.deleteMany({
      where: {
        AND: [
          {
            book_id: bookId
          },
          {
            reader_id: readerId
          }
        ]
      },
    }).then((result) => {
      if (result.count === 0) {
        throw new PrismaClientKnownRequestError(BOOK.BOOK_NOT_FOUND, { code: 'P2025' });
      }
      return result;
    });
  }
}

module.exports = BookService;
