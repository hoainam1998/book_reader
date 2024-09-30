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

export type { ModalSlotProps };
export {
  clsx,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  customError,
  createElementWrapper
};
