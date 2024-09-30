import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper } from './element-wrapper';
import PopUp from 'components/pop-up/pop-up';

const bodyDOM: HTMLElement = document.body;
const popUpContainer = createElementWrapper('pop-up', 'pop-up');
popUpContainer.dataset.testid = 'toast';

/**
 * Show pop-up frame.
 */
const showToast = (title: string, children: ReactNode): void => {
  if (!bodyDOM.contains(popUpContainer)) {
    bodyDOM.appendChild(popUpContainer);
    const root: Root | null = createRoot(popUpContainer);
    const closeToast = (): void => {
      root.unmount();
      popUpContainer.remove();
    };
    root.render(<PopUp title={title} onClose={closeToast}>{children}</PopUp>);
  }
};

export default showToast;