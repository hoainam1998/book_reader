import { Children, ReactElement, JSX } from 'react';
import { isSlot } from 'components/slot/slot';
import { clsx } from 'utils';
import FormControl from 'components/form/form-control/form-control';
import './style.scss';

export type SelectPropsType<T> = {
  value: T;
  options: { label: string, value: string | number, class?: string }[];
  children?: ReactElement;
  name: string;
  className?: string;
  labelClass?: string;
  selectClass?: string;
  label?: string;
  error?: boolean;
  errors?: string[];
  onChange: (value: T) => void;
};

function Select<T extends string | number | readonly string[] | undefined>
({
  options,
  children,
  name,
  value,
  label,
  className,
  labelClass,
  selectClass,
  error = false,
  errors = [],
  onChange
}: SelectPropsType<T>): JSX.Element {
  const hasChildren: boolean = Children.count(children) > 0;
  const optionSlot : ReactElement | undefined | null = hasChildren ? Children.only(children) : null;

  return (
    <FormControl name={name} label={label || ''} labelClass={labelClass} className={className} errors={errors}>
      <div className={clsx('select-wrapper', selectClass)}>
        <select className={clsx('select custom-input', { 'error-input': error })} name={name} id={name}
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
    </FormControl>
  );
}

export default Select;
