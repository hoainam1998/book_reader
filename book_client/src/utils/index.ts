import { showToast } from './toast';
import { showLoading, hideLoading } from './loading';

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
          return (cls[key] ? classTextEmpty += `${key} ` : classTextEmpty).trim();
        }, '').trim();
      case 'string':
        return cls.trim();
      default: return '';
    }
  });
  return classList.filter(cls => !!cls).join(' ').trim();
};

export {
  clsx,
  showToast,
  showLoading,
  hideLoading,
};
