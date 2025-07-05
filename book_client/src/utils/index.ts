import showToast from './toast';
import { showLoading, hideLoading } from './loading';
import showModal from './modal';
import { createElementWrapper } from './element-wrapper';
import { convertBase64ToSingleFile, openFile, getExtnameFromBlobType, getJsonFileContent } from './file-handle';
import generateResetPasswordLink from './generate-reset-password-link';
import { format } from 'date-fns';

/**
 * Return class text from array.
 *
 * @param {Array} classes - array contain object or string to parse them to class.
 * @returns {string} - class text.
 */
const clsx = (...classes: any[]): string => {
  const classList: string[] = classes.map((cls) => {
    switch (typeof cls) {
      case 'object':
        return Object.keys(cls)
          .reduce((classTextEmpty, key) => {
            return cls[key] ? (classTextEmpty += `${key} `) : classTextEmpty;
          }, '')
          .trim();
      case 'string':
        return cls.trim();
      default:
        return '';
    }
  });
  return classList
    .filter((cls) => !!cls)
    .join(' ')
    .trim();
};

/**
 * Return new error with message provided.
 *
 * @param {string} message - error message.
 * @returns {Error} - error with message have given!.
 */
const customError = (message: string) => new Error(`[Custom Error] ${message}`);

/**
 * Generating unique string id.
 *
 * @returns {string} - The id string.
 */
const stringRandom = () => {
  const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const RANDOM_STRING_LENGTH = 12;
  let result = '';

  for (let i = 0; i < RANDOM_STRING_LENGTH ; i++) {
    const randomId = Math.floor(Math.random() * CHARACTERS.length);
    result += CHARACTERS.charAt(randomId);
  }

  return result;
};

/**
 * Format date to string with format dd-MM-yyyy.
 *
 * @param {number | string} - The timestamp.
 * @returns {string} - The id string.
 */
const formatDate = (timestamp: number | string) => format(+timestamp, 'dd-MM-yyyy');

export {
  clsx,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  customError,
  createElementWrapper,
  convertBase64ToSingleFile,
  getExtnameFromBlobType,
  openFile,
  getJsonFileContent,
  stringRandom,
  generateResetPasswordLink,
  formatDate,
};
