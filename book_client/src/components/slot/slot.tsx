type SlotProps = {
  children: React.ReactElement;
  name: string;
};

function Slot({ children }: SlotProps): JSX.Element {
  return (children);
}

export const isSlot = (name: string, child: any): Boolean => {
  return child.type.name === 'Slot' && Object.hasOwn(child, 'props')
    && Object.hasOwn(child.props, 'name') && child.props.name === name;
};

export default Slot;
