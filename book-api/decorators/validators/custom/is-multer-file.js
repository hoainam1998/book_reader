const { validate, validating } = require('../helpers.js');

const isMulterFile = validate((value) => {
  const checkMulterFile = (file) => {
    const props = ['fieldname', 'originalname', 'encoding', 'mimetype', 'buffer', 'size'];
    return props.every(pro => Object.hasOwn(file, pro));
  };

  if (Array.isArray(value)) {
    return value.some(v => checkMulterFile(v));
  }
  return checkMulterFile(value);
});

const IsMulterFile = validating(isMulterFile);

module.exports = IsMulterFile;
