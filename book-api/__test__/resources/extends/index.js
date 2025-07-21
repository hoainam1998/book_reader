const { expect } = require('@jest/globals');
const toBeMatchList = require('./to-be-match-list');

module.exports = expect.extend({
  toBeMatchList,
});
