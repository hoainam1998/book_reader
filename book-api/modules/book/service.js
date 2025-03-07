const fs = require('fs');
const { join } = require('path');
const { saveFile, deleteFile } = require('#utils');
const Service = require('#services/prisma.js');

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
    const { name, avatar, publishedTime, publishedDay, categoryId, bookId } = book;
    return this.PrismaInstance.book.create({
      data: {
        book_id: bookId,
        name,
        avatar,
        published_day: publishedDay,
        published_time: publishedTime,
        category_id: categoryId
      },
    }).then(() => {
      return this.PrismaInstance.book_image.createMany({
        data: book.images.map(img => {
          img = { ...img, book_id: img.bookId };
          delete img.bookId;
          return img;
        })
      }).catch(error => { throw error; });
    }).catch(error =>  { throw error; });
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
    return this.PrismaInstance.book.findFirst({
      where: {
        book_id: bookId
      },
      select: {
        pdf: true
      },
    })
    .then((result) => {
      const oldPdfFile = `pdf/${name}.pdf`
      if (result) {
        if (result.pdf !== oldPdfFile) {
          const filePath = join(__dirname, `../../public/${result.pdf}`);
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            throw err;
          }
        }
      } else {
        throw new Error('Can not found pdf file!');
      }
    });
  }

  deleteIntroduceFile(bookId) {
    return this.PrismaInstance.book.findFirst({
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
      throw new Error('Can not found introduce file!');
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
    const { name, pdf, publishedTime, publishedDay, categoryId, bookId } = book;
    return this.PrismaInstance.book.update({
      where: {
        book_id: bookId
      },
      data: {
        name,
        pdf,
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
          data: book.images.map(img => {
            img = { ...img, book_id: img.bookId };
            delete img.bookId;
            return img;
          })
        }).catch(error => { throw error; });
      }).catch(error => { throw error; });
    })
    .catch(error =>  { throw error; });
  }

  getBookDetail(bookId, select) {
    return this.PrismaInstance.book.findUnique({
      where: {
        book_id: bookId
      },
      select
    });
  }

  getAllName() {
    return this.PrismaInstance.book.findMany({
      select: {
        name: true
      }
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
      book_id: bookId
    });
  }
}

module.exports = BookService;
