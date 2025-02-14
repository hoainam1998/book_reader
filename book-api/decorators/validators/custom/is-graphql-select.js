const { validate, validating } = require('../helpers.js');

const isGraphqlSelect = validate((value) => {
  const graphqlSelectChecker = (value) => {
    if (typeof value === 'object') {
      return Object.values(value).every(v => graphqlSelectChecker(v));
    } else {
      return typeof value === 'boolean';
    }
  };
  return typeof value === 'object' && graphqlSelectChecker(value);
});

const IsGraphqlSelect = validating(isGraphqlSelect);

module.exports = IsGraphqlSelect;
