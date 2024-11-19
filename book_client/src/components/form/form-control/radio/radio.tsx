import { JSX, useCallback } from 'react';
import FormControl, { FormControlProps, OptionPrototype } from '../form-control';
import List from 'components/list/list';
import { FieldValidateProps } from 'hooks/useForm';
import { clsx } from 'utils';
import './style.scss';

type RadioPropsType<T> = { horizontal?: boolean } & Partial<FieldValidateProps<T>> & FormControlProps;

function Radio<T>({ name, value, label, options, horizontal, onChange, onFocus }: RadioPropsType<T>): JSX.Element {

  const defaultChecked = useCallback((radioValue: number | string): boolean => {
    return ((typeof value === 'string') ?  parseInt(value) : value) === radioValue;
  }, [value, options]);

  const radioValueChange = (e: any) => {
    onChange!(e!);
  };

  return (
    <FormControl name={name} label={label}>
      <ul className={clsx(horizontal && 'horizontal')}>
        <List<OptionPrototype<number>>
          items={options as OptionPrototype<number>[]}
          render={(item) => {
            return (
              <li>
                <label className="radio-wrapper">
                  <input
                    type="radio"
                    name={name}
                    value={item.value}
                    checked={defaultChecked(item.value!)}
                    onChange={radioValueChange}
                    onFocus={onFocus}/>
                  <span className="checkmark" />
                  <span>{item.label}</span>
                </label>
              </li>
            );
          }}
        />
      </ul>
    </FormControl>
  );
}

export default Radio;
