import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper } from './element-wrapper';
import Modal from 'components/modal/modal';
import { ModalPropsType } from 'interfaces';

const bodyDOM: HTMLElement = document.body;
const modalContainer: HTMLDivElement = createElementWrapper('modal-container', 'modal-container');

type ModalPropsShowingType = Omit<ModalPropsType, 'onClose'> & {
  onClose?: () => void;
};

/**
 * Create a root to show modal, when hide it, using root.unmount.
 */
const showModal = (props: ModalPropsShowingType): void => {
  const {
    children,
    title,
    size,
    onClose,
    onOpen,
    headerClass,
    bodyClass,
    footerClass,
    headerStyle,
    bodyStyle,
    footerStyle,
  } = props;

  if (!bodyDOM.contains(modalContainer)) {
    bodyDOM.appendChild(modalContainer);
    const root: Root | null = createRoot(modalContainer);
    onOpen && onOpen();

    const hideModal = (): void => {
      onClose && onClose();
      modalContainer.remove();
      root.unmount();
    };
    root.render(
      <Modal
        title={title}
        size={size}
        headerClass={headerClass}
        bodyClass={bodyClass}
        footerClass={footerClass}
        headerStyle={headerStyle}
        bodyStyle={bodyStyle}
        footerStyle={footerStyle}
        onClose={hideModal}>
          {children}
      </Modal>);
  }
};

export default showModal;
