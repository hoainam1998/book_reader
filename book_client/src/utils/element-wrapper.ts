/**
 * Return element container with class and id have been provided.
 *
 * @param {string} className - class element.
 * @param {string} id - id of element.
 * @returns {HTMLDivElement} - container.
 */
const createElementWrapper = (id: string, className?: string): HTMLDivElement => {
  const container: HTMLDivElement = document.createElement('div');
  if (className) {
    container.classList.add(className);
  }
  container.id = id;
  return container;
};

/**
 * Remove child element from body element.
 *
 * @param {HTMLElement} childElement - element to remove.
 * @returns {void}
 */
const removeElementWrapper = (childElement: HTMLElement): void => {
  const bodyElement: HTMLElement = document.body;
  if (bodyElement.contains(childElement)) {
    bodyElement.removeChild(childElement);
  }
};

export {
  createElementWrapper,
  removeElementWrapper
};
