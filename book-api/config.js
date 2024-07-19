const { createPool } = require('mysql');
const Query = require('./query.js');

const pool = createPool({
  host: process.env.HOST,
  user: process.env.USER,
  database: 'books',
  multipleStatements: true,
  typeCast: function (field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return (field.string() === '1');
    } else {
      return next();
    }
  }
});

function connectDataBase() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('Connect to database fail!');
        pool.end(() => {
          console.log('Force disconnect success!');
        });
        reject(err);
      } else {
        console.log('Connect to database success!');
        resolve(new Query(connection));
      }
    });
  });
}

module.exports = connectDataBase;
