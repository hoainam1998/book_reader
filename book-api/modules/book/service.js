const { join } = require('path');
const { saveFile, deleteFile } = require('#utils');
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
    });
  }

  getAllBooks(select) {
    return this.PrismaInstance.book.findMany({
      select
    });
  }

  pagination(pageSize, pageNumber, keyword, select) {
    const offset = (pageNumber - 1) * pageSize;
    if (keyword) {
      return this.PrismaInstance.$transaction([
        this.PrismaInstance.book.findMany({
          take: pageSize,
          skip: offset,
          where: {
            name: {
              contains: keyword
            }
          },
          orderBy: {
            book_id: 'desc',
          },
          select
        }),
        this.PrismaInstance.book.count({
          where: {
            name: {
              contains: keyword
            }
          }
        }),
      ]);
    }
    return this.PrismaInstance.$transaction([
      this.PrismaInstance.book.findMany({
        take: pageSize,
          skip: offset,
          orderBy: {
            book_id: 'desc',
          },
          select
      }),
      this.PrismaInstance.book.count(),
    ]);
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
}

module.exports = BookService;
