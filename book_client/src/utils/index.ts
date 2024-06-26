import validateHelper, { required } from './validate';
import type { ValidateFunction, ValidateProcess } from './validate';
/**
 * Return class text from array.
 *
 * @param {Array} - array contain object or string to parse them to class.
 * @returns {string} - class text.
 */
const clsx = (...classes: any[]): string => {
  const classList: string[] = classes.map(cls => {
    switch (typeof cls) {
      case 'object':
        return  Object.keys(cls).reduce((classTextEmpty, key) => {
          return cls[key] ? classTextEmpty += `${key} ` : classTextEmpty;
        }, '').trim();
      case 'string':
        return cls;
      default: return '';
    }
  });
  return classList.join(' ').trim();
};

export {
  clsx,
  validateHelper,
  required,
  ValidateFunction,
  ValidateProcess,
};
