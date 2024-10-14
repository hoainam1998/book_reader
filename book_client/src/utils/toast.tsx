import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper } from './element-wrapper';
import PopUp from 'components/pop-up/pop-up';

const bodyDOM: HTMLElement = document.body;
const popUpQueue: any[] = [];
const defaultDuration: number = 2000;
const spaceBetweenPopUp: number = 10;
let timer: number = 0;
let popupHeight: number = 0;

/**
 * Show pop-up frame.
 */
const showToast = (title: string, children: ReactNode): void => {
  const popUpContainer = createElementWrapper('pop-up', 'pop-up');
  popUpContainer.dataset.testid = 'toast';

  const updateHeight = (): void => {
    timer += 1;
    popupHeight = popUpContainer.clientHeight || 0;
    popUpContainer.style.bottom = (timer - 1) * (popupHeight + spaceBetweenPopUp) + spaceBetweenPopUp + 'px';
  };

  bodyDOM.appendChild(popUpContainer);
  const root: Root | null = createRoot(popUpContainer);

  const translateBottomNextPopup = (currentPopup: any): void => {
    const nextSibling = (currentPopup.nextElementSibling! as any);
    if (nextSibling) {
      nextSibling!.style.bottom
        = (+(nextSibling.style.bottom.replace(/px/, ''))
        - (popupHeight + spaceBetweenPopUp)) + 'px';
      translateBottomNextPopup(nextSibling);
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
    const duration: number = popUpQueue.length * defaultDuration;
    setTimeout(() => {
      if (popUpQueue.length === 1) return;
      const fn = popUpQueue.pop();
      fn();
      removePopUp();
    }, duration);
  };

  removePopUp();
};

export default showToast;
