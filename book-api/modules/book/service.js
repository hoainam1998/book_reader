const fs = require('fs');
const { join } = require('path');
const { saveFile } = require('#utils');
const { Prisma } = require('@prisma/client');
const Service = require('../service');

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
    const { name, pdf, publishedTime, publishedDay, categoryId, bookId } = book;
    return this.PrismaInstance.book.create({
      data: {
        book_id: bookId,
        name,
        pdf,
        published_day: publishedDay,
        published_time: publishedTime,
        category_id: categoryId
      },
    });
  }

  saveBookAvatar(avatar, bookId) {
    return this.PrismaInstance.book.update({
      where: {
        book_id: bookId
      },
      data: {
        avatar
      },
    });
  };

  saveBookImages(images, bookId, name) {
    const imagesRecord = images.reduce((arr, image, index) => {
      arr.push({
        name: name[index],
        book_id: bookId,
        image
      });
      return arr;
    }, []);

    return this.PrismaInstance.book_image.createMany({
      data: imagesRecord,
    });
  }

  deletePdfFile(bookId) {
    return this.PrismaInstance.book.findFirst({
      where: {
        book_id: bookId
      },
      select: {
        pdf: true
      },
    })
    .then((result) => {
      if (result) {
        const filePath = join(__dirname, `../../public/${result.pdf}`);
        try {
          fs.unlinkSync(filePath);
          return true;
        } catch (err) {
          throw err;
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
       console.log('result delete intro', result);
      if (result && result.introduce_file) {
        const filePath = result.introduce_file.split(',');
        const htmlFilePath = filePath[0].trim();
        const jsonFilePath = filePath[1].trim();
        const deleteFile = (filePath) => {
          return new Promise((resolve, reject) => {
            fs.unlink(join(__dirname, `../../public/${filePath}`), (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            });
          });
        };
        return Promise.all([deleteFile(htmlFilePath), deleteFile(jsonFilePath)]);
      }
      return true;
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
    });
  }

  getBookDetail(bookId) {
    return this.PrismaInstance.$transaction([
      this.PrismaInstance.$queryRaw
        `SELECT name, pdf,
        PUBLISHED_TIME AS publishedTime,
        PUBLISHED_DAY AS publishedDay,
        CATEGORY_ID AS categoryId,
        INTRODUCE_FILE AS introduce,
        AVATAR AS avatar FROM BOOK WHERE BOOK_ID = ${bookId};`,
      this.PrismaInstance.$queryRaw`SELECT image, name FROM BOOK_IMAGE WHERE BOOK_ID = ${bookId};`
    ]);
  }

  getAllName() {
    return this.PrismaInstance.$queryRaw`SELECT NAME AS name FROM BOOK;`;
  }

  pagination(pageSize, pageNumber, keyword) {
    const sqlQuery =
    Prisma.sql`SELECT
    BOOK_ID AS bookId,
    NAME AS name,
    PDF AS pdf,
    PUBLISHED_DAY AS publishedDay,
    PUBLISHED_TIME AS publishedTime,
    (SELECT NAME FROM CATEGORY WHERE CATEGORY_ID = book.CATEGORY_ID) AS category,
    INTRODUCE_FILE AS introduce,
    AVATAR AS avatar FROM BOOK AS book`;
    const offset = (pageNumber - 1) * pageSize;
    if (keyword) {
      return this.PrismaInstance.$transaction([
        this.PrismaInstance.$queryRaw`${sqlQuery} WHERE NAME LIKE %${keyword}% ORDER BY BOOK_ID DESC LIMIT ${pageSize} OFFSET ${offset};`,
        this.PrismaInstance.$queryRaw`SELECT COUNT(*) AS total FROM BOOK WHERE NAME LIKE %${keyword}%;`
      ]);
    }
    return this.PrismaInstance.$transaction([
      this.PrismaInstance.$queryRaw`${sqlQuery} ORDER BY BOOK_ID DESC LIMIT ${pageSize} OFFSET ${offset};`,
      this.PrismaInstance.$queryRaw`SELECT COUNT(*) AS total FROM BOOK;`,
    ]);
  };
}

module.exports = BookService;
