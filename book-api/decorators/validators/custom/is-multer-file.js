const { validate, validating } = require('#helpers');

const isMulterFile = validate((value) => {
  if (value) {
    const checkMulterFile = (file) => {
      const props = ['fieldname', 'originalname', 'encoding', 'mimetype', 'buffer', 'size'];
      return props.every(pro => Object.hasOwn(file, pro));
    };

    if (Array.isArray(value)) {
      return value.some(v => checkMulterFile(v));
    }

    return checkMulterFile(value);
  }
  return false;
});

const IsMulterFile = validating(isMulterFile);

module.exports = IsMulterFile;
