import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import PopUp from 'components/pop-up/pop-up';

let isToastShowed = false;

const showToast = (title: string, children: ReactNode) => {
  if (!isToastShowed) {
    const root = createRoot(document.getElementById('pop-up')!);
    const closeToast = () => {
      root.unmount();
      isToastShowed = false;
    };
    root.render(<PopUp title={title} onClose={closeToast}>{children}</PopUp>);
    isToastShowed = true;
  }
};

export {
  showToast
};
