import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import PopUp from 'components/pop-up/pop-up';

let isToastShowed: boolean = false;

/**
 * Show pop-up frame.
 */
const showToast = (title: string, children: ReactNode) => {
  if (!isToastShowed) {
    const root: Root | null = createRoot(document.getElementById('pop-up')!);
    const closeToast = (): void => {
      root.unmount();
      isToastShowed = false;
    };
    root.render(<PopUp title={title} onClose={closeToast}>{children}</PopUp>);
    isToastShowed = true;
  }
};

export default showToast;