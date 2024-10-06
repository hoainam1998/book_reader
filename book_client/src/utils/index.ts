import showToast from './toast';
import { showLoading, hideLoading } from './loading';
import showModal, { ModalSlotProps } from './modal';
import { createElementWrapper } from './element-wrapper';

/**
 * Return class text from array.
 *
 * @param {Array} classes - array contain object or string to parse them to class.
 * @returns {string} - class text.
 */
const clsx = (...classes: any[]): string => {
  const classList: string[] = classes.map(cls => {
    switch (typeof cls) {
      case 'object':
        return  Object.keys(cls).reduce((classTextEmpty, key) => {
          return (cls[key] ? classTextEmpty += `${key} ` : classTextEmpty);
        }, '').trim();
      case 'string':
        return cls.trim();
      default: return '';
    }
  });
  return classList.filter(cls => !!cls).join(' ').trim();
};

/**
 * Return new error with message provided.
 *
 * @param {string} message - error message.
 * @returns {Error} - error with message have given!.
 */
const customError = (message: string) => new Error(`[Custom Error] ${message}`);

/**
 * Return extension from blob type.
 *
 * @param {string} blobType - base64 string present image.
 * @returns {string} - extension name.
 */
const getExtnameFromBlobType = (blobType: string): string => {
  const matches: RegExpMatchArray | null = blobType.match(/(\/\w+)/);
  return matches ? matches[0].replace('/', '.') : '';
};

/**
 * Return promise of file from base64 string.
 *
 * @param {string} imageBase64String - base64 string present image.
 * @param {string} name - file name.
 * @returns {Promise<File>} - promise file.
 */
const convertBase64ToSingleFile = (imageBase64String: string, name: string): Promise<File> => {
  return fetch(imageBase64String)
    .then(res => res.blob())
    .then(blob => {
      if (name.search((/\.\w+/)) < 0) {
        const ext: string = getExtnameFromBlobType(blob.type);
        name = `${name}${ext}`;
      }
      return new File([blob], name, { type: blob.type });
    });
};

export type { ModalSlotProps };
export {
  clsx,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  customError,
  createElementWrapper,
  convertBase64ToSingleFile,
  getExtnameFromBlobType
};
