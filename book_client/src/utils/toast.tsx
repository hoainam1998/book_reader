import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper } from './element-wrapper';
import PopUp from 'components/pop-up/pop-up';

const bodyDOM: HTMLElement = document.body;
const popUpQueue: (() => void)[] = [];
const defaultDuration: number = 2000;
const spaceBetweenPopUp: number = 10;
let numberElement: number = 0;
let popupHeight: number = 0;

/**
 * Show pop-up frame.
 *
 * @param {string} title - The toast title.
 * @param {ReactNode} children - The toast content.
 */
const showToast = (title: string, children: ReactNode): void => {
  if (!title || !children) {
    console.warn('[Toast] Title or body is missing!');
    return;
  }
  const popUpContainer = createElementWrapper('pop-up', 'pop-up');
  popUpContainer.dataset.testid = 'toast';

  const updateHeight = (): void => {
    numberElement = document.querySelectorAll('.pop-up').length;
    popupHeight = popUpContainer.clientHeight || 0;
    popUpContainer.style.bottom =
      (numberElement - 1) * (popupHeight + spaceBetweenPopUp) + spaceBetweenPopUp + 'px';
  };

  bodyDOM.appendChild(popUpContainer);
  const root: Root | null = createRoot(popUpContainer);

  const translateBottomNextPopup = (currentPopup: HTMLDivElement): void => {
    const nextSibling = currentPopup.nextElementSibling! as HTMLDivElement;
    if (nextSibling) {
      const currentBottom: number = +nextSibling.style.bottom.replace(/px/, '');
      if (currentBottom && currentBottom > 10) {
        const bottom: number = currentBottom - (popupHeight + spaceBetweenPopUp);
        nextSibling!.style.bottom = bottom + 'px';
        translateBottomNextPopup(nextSibling);
      }
    }
  };

  const closeToast = (): void => {
    translateBottomNextPopup(popUpContainer);
    root.unmount();
    popUpContainer.remove();
  };

  root.render(
    <PopUp title={title} onClose={closeToast} updateHeight={updateHeight}>
      {children}
    </PopUp>
  );

  popUpQueue.unshift(closeToast);

  const removePopUp = (): void => {
    const duration: number = numberElement * defaultDuration;
    setTimeout(() => {
      if (popUpQueue.length === 1) return;
      const fn = popUpQueue.pop();
      fn!();
      removePopUp();
    }, duration);
  };

  removePopUp();
};

export default showToast;
