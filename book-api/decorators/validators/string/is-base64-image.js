const { validate, validating } = require('#helpers');

const base64ImagePattern = /data:image\/(png|jpeg|jpg);base64,.+/;

const isBase64Image = validate((value) => {
  if (Array.isArray(value)) {
    return value.every((v) => base64ImagePattern.test(v));
  }
  return base64ImagePattern.test(value);
});

const IsBase64Image = validating(isBase64Image);

module.exports = IsBase64Image;
