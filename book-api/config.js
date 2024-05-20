const { createConnection } = require('mysql');
const Query = require('./query.js');

const connectionInstance = createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  database: 'books'
});

function connectDataBase() {
  return new Promise((resolve, reject) => {
    connectionInstance.connect((err) => {
      if (err) {
        console.log('Connect to database fail!');
        reject(err);
      } else {
        console.log('Connect to database success!');
        resolve(new Query(connectionInstance));
      }
    });
  });
}

module.exports = connectDataBase;
