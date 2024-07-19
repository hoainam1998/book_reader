class CategoryService {
  _sql = null;

  constructor(sql) {
    this._sql = sql;
  }

  create(category) {
    return this._sql.query('INSERT INTO CATEGORY (category_id, name, avatar) VALUES (?)',
      [[category.categoryId, category.name, category.avatar]]);
  }

  all() {
    return this._sql.query('SELECT * FROM CATEGORY');
  }

  pagination(pageSize, pageNumber) {
    return this._sql.query(
    `SELECT *, IF((SELECT COUNT(*) FROM book AS bo WHERE ca.category_id LIKE bo.category_id > 0), true, false) AS disabled FROM category as ca LIMIT ? OFFSET ?;
    SELECT COUNT(*) AS total FROM CATEGORY;`,
    [pageSize, (pageNumber - 1) * pageSize]);
  }

  detail(id) {
    return this._sql.query('SELECT * FROM CATEGORY WHERE CATEGORY_ID = ?', id);
  }

  update(category) {
    if (category.avatar) {
      return this._sql.query('UPDATE CATEGORY SET NAME = ?, AVATAR = ? WHERE CATEGORY_ID = ?',
        [category.name, category.avatar, category.categoryId]);
    } else {
      return this._sql.query('UPDATE CATEGORY SET NAME = ? WHERE CATEGORY_ID = ?',
        [category.name, category.categoryId]);
    }
  }

  delete(id) {
    return this._sql.query('DELETE FROM CATEGORY WHERE CATEGORY_ID = ?', id);
  }
}

module.exports = CategoryService;
