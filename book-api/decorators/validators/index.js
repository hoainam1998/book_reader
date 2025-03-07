const IsPositive = require('./number/is-positive.js');
const IsString = require('./string/is-string.js');
const IsArray = require('./array/is-array.js');
const IsObject = require('./object/is-object.js');
const IsRangeContain = require('./number/is-range-contain.js');
const IsEmail = require('./string/is-email.js');
const IsPassword = require('./string/is-password.js');
const IsNumeric = require('./string/is-numeric.js');
const Length = require('./common/length.js');
const IsOptional = require('./common/is-optional.js');
const IsBase64Image = require('./string/is-base64-image.js');
const IsBoolean = require('./boolean/is-boolean.js');
const IsGraphqlSelect = require('./custom/is-graphql-select.js');
const IsId = require('./custom/is-id.js');
const IsIds = require('./custom/is-ids.js');
const IsMulterFile = require('./custom/is-multer-file.js');

module.exports = {
  IsPositive,
  IsString,
  IsArray,
  IsObject,
  IsRangeContain,
  IsEmail,
  IsPassword,
  IsNumeric,
  Length,
  IsBase64Image,
  IsGraphqlSelect,
  IsOptional,
  IsBoolean,
  IsId,
  IsIds,
  IsMulterFile,
};
