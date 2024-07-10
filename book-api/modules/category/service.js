class CategoryService {
  _sql = null;

  constructor(sql) {
    this._sql = sql;
  }

  create(category) {
    return this._sql.query('INSERT INTO CATEGORY (category_id, name, avatar) VALUES (?)',
      [[category.category_id, category.name, category.avatar]]);
  }

  all() {
    return this._sql.query('SELECT * FROM CATEGORY');
  }

  pagination(pageSize, pageNumber) {
    return this._sql.query('SELECT * FROM CATEGORY LIMIT ? OFFSET ?', [pageSize, (pageNumber - 1) * pageSize]);
  }

  detail(id) {
    return this._sql.query('SELECT * FROM CATEGORY WHERE CATEGORY_ID = ?', id);
  }

  update(category) {
    if (category.avatar) {
      return this._sql.query('UPDATE CATEGORY SET NAME = ?, AVATAR = ? WHERE CATEGORY_ID = ?',
        [category.name, category.avatar, category.category_id]);
    } else {
      return this._sql.query('UPDATE CATEGORY SET NAME = ? WHERE CATEGORY_ID = ?',
        [category.name, category.category_id]);
    }
  }

  delete(id) {
    return this._sql.query('DELETE FROM CATEGORY WHERE CATEGORY_ID = ?', id);
  }
}

module.exports = CategoryService;
