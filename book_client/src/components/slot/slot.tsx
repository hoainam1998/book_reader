import React, { JSX } from 'react';

export type SlotProps = {
  name: string;
  children?: React.ReactNode;
  // eslint-disable-next-line no-unused-vars
  render?: (slotProps: any) => React.ReactElement;
};

function Slot({ children }: SlotProps): JSX.Element {
  return children ? <>{children}</> : <></>;
}

export const isSlot = (name: string, child: any): Boolean => {
  return child.type.name === 'Slot' && Object.hasOwn(child, 'props')
    && Object.hasOwn(child.props, 'name') && child.props.name === name;
};

export default Slot;
