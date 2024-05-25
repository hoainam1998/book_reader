const clsx = (objectClass: { [key: string]: boolean }): string => Object.keys(objectClass).reduce((classes, key) => {
  if (objectClass[key]) {
    classes += `${key} `;
  }
  return classes;
}, '').trim();

export {
  clsx
};
