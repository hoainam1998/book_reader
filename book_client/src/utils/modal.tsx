import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Modal from 'components/modal/modal';

const bodyDOM: HTMLElement = document.body;
const modalContainer: HTMLDivElement = document.createElement('div');
modalContainer.classList.add('modal-container');
modalContainer.id = 'modal-container';

type ModalUtilProps = {
  children: ReactNode | ReactNode[];
  title: string;
  size?: string;
  onOpen?: () => void;
  onClose?: () => void;
};

/**
 * Create a root to show modal, when hide it, using root.unmount.
 */
const showModal = (props: ModalUtilProps): void => {
  const { children, title, size, onClose, onOpen } = props;

  if (!bodyDOM.contains(modalContainer)) {
    bodyDOM.appendChild(modalContainer);
    const root: Root | null = createRoot(document.getElementById('modal-container')!);
    onOpen && onOpen();

    const hideModal = (): void => {
      onClose && onClose();
      modalContainer.remove();
      root.unmount();
    };
    root.render(<Modal title={title} size={size} onClose={hideModal}>{children}</Modal>);
  }
};

export default showModal;
