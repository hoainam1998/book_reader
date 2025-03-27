const IsPositive = require('./number/is-positive');
const IsString = require('./string/is-string');
const IsArray = require('./array/is-array');
const IsObject = require('./object/is-object');
const IsRangeContain = require('./number/is-range-contain');
const IsEmail = require('./string/is-email');
const IsPassword = require('./string/is-password');
const IsNumeric = require('./string/is-numeric');
const Length = require('./common/length');
const IsOptional = require('./common/is-optional');
const IsBase64Image = require('./string/is-base64-image');
const IsBoolean = require('./boolean/is-boolean');
const IsGraphqlSelect = require('./custom/is-graphql-select');
const IsId = require('./custom/is-id');
const IsIds = require('./custom/is-ids');
const IsMulterFile = require('./custom/is-multer-file');

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
