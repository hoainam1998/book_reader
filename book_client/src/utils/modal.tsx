import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Modal from 'components/modal/modal';

const bodyDOM = document.body;
const modalContainer = document.createElement('div');
modalContainer.classList.add('modal-container');
modalContainer.id = 'modal-container';

/**
 * Create a root to show modal, when hide it, using root.unmount.
 */
const showModal = (children: ReactNode | ReactNode[], title: string, size?: string): void => {
  if (!bodyDOM.contains(modalContainer)) {
    bodyDOM.appendChild(modalContainer);
    const root: Root | null = createRoot(document.getElementById('modal-container')!);

    const hideModal = (): void => {
      modalContainer.remove();
      root.unmount();
    };
    root.render(<Modal title={title} size={size} onClose={hideModal}>{children}</Modal>);
  }
};

export default showModal;
