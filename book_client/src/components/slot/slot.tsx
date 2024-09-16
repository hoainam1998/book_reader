import React, { JSX } from 'react';

export type SlotProps<T> = {
  name: string;
  children?: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  render?: (slotProps: T) => React.ReactNode;
};

function Slot<T>({ children }: SlotProps<T>): JSX.Element {
  return children ? <>{children}</> : <></>;
}

export const isSlot = (name: string, child: any): Boolean => {
  return child.type.name === 'Slot' && Object.hasOwn(child, 'props')
    && Object.hasOwn(child.props, 'name') && child.props.name === name;
};

export default Slot;
