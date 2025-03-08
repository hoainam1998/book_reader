/* eslint-disable no-unused-vars */
import React, { Children, JSX, ReactNode } from 'react';
import { isSlot } from 'components/slot/slot';
import RenderCondition from 'components/render-condition/render-condition';
import { customError, clsx } from 'utils';
import './style.scss';

export enum ModalSize {
  LARGE = 'lg',
  MEDIUM = 'md',
  SMALL = 'sm',
}

type ModalPropsType = {
  title: string;
  children: ReactNode[] | ReactNode;
  size?: ModalSize;
  onClose: () => void;
};

type ModalSlotsType = {
  header: React.ReactNode;
  body: React.ReactNode;
  footer: React.ReactNode;
};

export type ModalSlotPropsType = {
  onClose: () => void;
};

const slotMapping = (child: JSX.Element, onClose: ModalPropsType['onClose'], slots: ModalSlotsType): void => {
  const renderChild = (): JSX.Element => (child.props.render ? child.props.render({ onClose }) : child);

  switch (true) {
    case isSlot('header', child): slots.header = renderChild(); break;
    case isSlot('body', child): slots.body = renderChild(); break;
    case isSlot('footer', child): slots.footer = renderChild(); break;
    default: throw customError('[Custom Error] Invalid modal slot!');
  }
};

function Modal({ onClose, children, title, size = ModalSize.MEDIUM }: ModalPropsType): JSX.Element {
  const slots: ModalSlotsType = {
    header: null,
    body: null,
    footer: null
  };

  if (Children.count(children) > 0) {
    Children.forEach(children as JSX.Element[], (child: JSX.Element) => {
      if (child.props.children.length > 0) {
        child.props.children.forEach((c: JSX.Element) => slotMapping(c, onClose, slots));
      } else {
        slotMapping(child, onClose, slots);
      }
    });
  }

  const { header, body, footer } = slots;

  return (
    <div className={clsx('modal', size)}>
      <div className="header-modal">
        <RenderCondition condition={Boolean(header)} then={header} not={
          <>
            <h3>{title}</h3>
            <span className="close-icon" onClick={onClose}>
              <img width="20" height="20" src={require('images/icons/close.svg')} alt="close" />
            </span>
          </>
        } />
      </div>
      <div className="body-modal">{body}</div>
      <div className="footer-modal">{footer}</div>
    </div>
  );
}

export default Modal;
