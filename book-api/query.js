class Query {
  _db = null;

  constructor(db) {
    this._db = db;
  }

  query(sql, values) {
    return new Promise((resolve, reject) => {
      const callback = (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(JSON.stringify(result)));
        }
      };

      if (values) {
        this._db.query(sql, values, callback);
      } else {
        this._db.query(sql, callback);
      }
    });
  }
}

module.exports = Query;
