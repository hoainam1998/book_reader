import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper } from './element-wrapper';
import Modal, { ModalSize } from 'components/modal/modal';

const bodyDOM: HTMLElement = document.body;
const modalContainer: HTMLDivElement = createElementWrapper('modal-container', 'modal-container');

type ModalUtilProps = {
  children: ReactNode | ReactNode[];
  title: string;
  size?: ModalSize;
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
    const root: Root | null = createRoot(modalContainer);
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
