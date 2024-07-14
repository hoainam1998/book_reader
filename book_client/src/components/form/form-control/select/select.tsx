import { Children, ReactElement, JSX } from 'react';
import { isSlot } from 'components/slot/slot';
import './style.scss';

type SelectProps<T> = {
  value: T;
  options: { label: string, value: string | number, class?: string }[];
  children?: ReactElement;
  name: string;
  label?: {
    class?: string;
    text: string;
  };
  classes?: string;
  onChange: (value: T) => void;
};

function Select<T extends string | number | readonly string[] | undefined>
({
  options,
  children,
  name,
  value,
  label,
  classes,
  onChange
}: SelectProps<T>): JSX.Element {
  const hasChildren: boolean = Children.count(children) > 0;
  const optionSlot : ReactElement | undefined | null = hasChildren ? Children.only(children) : null;

  return (
    <>
      {label && <label htmlFor={name} className={label.class}>{label.text}</label>}
      <div className="select-wrapper">
        <select className={`select custom-input ${classes}`} name={name} id={name}
        defaultValue={value} onChange={(event) => onChange(event.target.value as T)}>
          {
            options.map((option, index) =>
              <option key={index} value={option.value} className={option.class}>
                {
                  hasChildren && isSlot('default', optionSlot)
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
