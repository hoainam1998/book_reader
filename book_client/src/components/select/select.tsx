import { Children } from 'react';
import { isSlot } from 'components/slot/slot';
import './style.scss';

type SelectProps = {
  options: { label: string, value: string | number, class?: string }[];
  children?: React.ReactElement;
  name: string;
  label?: {
    class?: string;
    text: string;
  },
  classes?: string;
};

function Select({ options, children, name, label, classes }: SelectProps): JSX.Element {
  const hasChildren: boolean = Children.count(children) > 0;
  let optionSlot : React.ReactElement | undefined;

  if (hasChildren) {
    optionSlot = Children.only(children);
  }

  return (
    <>
      {label && <label htmlFor={name} className={label.class}>{label.text}</label>}
      <div className="select-wrapper">
        <select className={`select ${classes}`} name={name} id={name}>
          {
            options.map((option, index) =>
              <option key={index} value={option.value} className={option.class}>
                {
                  Boolean(hasChildren && isSlot('default', optionSlot))
                  ? optionSlot!.props.render(option)
                  : option.label
                }
              </option>)
          }
        </select>
      </div>
    </>
  );
}

export default Select;
