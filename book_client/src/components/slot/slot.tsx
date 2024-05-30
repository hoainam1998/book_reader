import React from 'react';

export type SlotProps = {
  name: string;
  slotProps?: any;
  // eslint-disable-next-line no-unused-vars
  render: (slotProps: any) => React.ReactElement;
};

function Slot({ render, slotProps }: SlotProps): JSX.Element {
  return render(slotProps);
}

export const isSlot = (name: string, child: any): Boolean => {
  return child.type.name === 'Slot' && Object.hasOwn(child, 'props')
    && Object.hasOwn(child.props, 'name') && child.props.name === name;
};

export default Slot;
