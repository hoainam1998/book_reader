import { useCallback, JSX, useEffect, useState } from 'react';
import { Blocker } from 'react-router-dom';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import { showModal, ModalSlotProps } from 'utils';
import { useBlockerContext } from './blocker-context';

type ModalNavigationPropsType = {
  body?: JSX.Element | ((blocker: Blocker) => JSX.Element);
  footer?: ((blocker: Blocker) => JSX.Element);
  onLeaveAction?: () => void;
};

export default ({ body, footer, onLeaveAction }: ModalNavigationPropsType = {}): void => {
  const [isNavigation, setIsNavigation] = useState<boolean>(false);
  const blocker: Blocker = useBlockerContext();

  body = body instanceof Function ? body(blocker) : body;

  const onClose = useCallback((): void => blocker!.reset!(), [blocker]);

  const bodyModal: JSX.Element = (
    <Slot name="body">
      <p style={{ textAlign: 'center' }}>
        All information you have been filled will lost.
        Are you sure to leave this page!
      </p>
    </Slot>
  );

  const footerModal = useCallback((): JSX.Element => {
    const onLeave = (): void => {
      if (blocker.state === 'blocked') {
        blocker!.proceed!();
        onLeaveAction && onLeaveAction();
      }
    };

    const onCloseModal = (onClose: () => void): void => {
      onClose();
      blocker!.reset!();
    };

    return (
      <Slot<ModalSlotProps>
        name="footer"
        render={({ onClose }) => (
          <div className="footer-navigation-modal">
            <Button variant="success"
              onClick={() => onCloseModal(onClose)}>
                Stay
            </Button>
            <Button variant="outline"
              onClick={() => {
                onLeave();
                onClose();
              }}>
              Leave
            </Button>
          </div>
        )}
      />
    );
  }, [blocker.state]);

  useEffect(() => {
    setIsNavigation(blocker.state === 'blocked');
  }, [blocker.state]);

  useEffect(() => {
    if (isNavigation) {
      showModal({
        children:
        <>
          {body ? body : bodyModal}
          {footer ? footer(blocker) : footerModal()}
        </>,
        title: 'Navigation warning!',
        size: 'sm',
        onClose
      });
      setIsNavigation(false);
    }
  }, [isNavigation]);
};
