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
        const classText = Object.keys(cls).reduce((classTextEmpty, key) => {
          if (cls[key]) {
            classTextEmpty += `${key} `;
          }
          return classTextEmpty;
        }, '').trim();
        return classText;
      case 'string':
        return cls;
      default: return '';
    }
  });
  return classList.join(' ');
}

export {
  clsx
};
