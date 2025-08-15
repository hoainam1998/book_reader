const { expect } = require('@jest/globals');
const toBeMatchList = require('./to-be-match-list');
const toBeBookImages = require('./to-be-book-images');
const toBeBookAuthors = require('./to-be-authors');
const toBeBookCategory = require('./to-be-book-category');
const toBeBookIntroduce = require('./to-be-book-introduce');
const toBeRelateBooks = require('./to-be-relate-book');

module.exports = expect.extend({
  toBeMatchList,
  toBeBookImages,
  toBeBookAuthors,
  toBeBookCategory,
  toBeBookIntroduce,
  toBeRelateBooks,
});
