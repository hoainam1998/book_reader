import { JSX, useCallback } from 'react';
import FormControl, { FormControlProps, OptionPrototype } from '../form-control';
import List from 'components/list/list';
import { FieldValidateProps } from 'hooks/useForm';
import { clsx } from 'utils';
import './style.scss';

type RadioPropsType<T> = { horizontal?: boolean } & Partial<FieldValidateProps<T>> & FormControlProps;

function Radio<T>({ name, value, label, options, horizontal, onChange, onFocus }: RadioPropsType<T>): JSX.Element {

  const defaultChecked = useCallback((radioValue: number | string): boolean => {
    const transformValue = (): unknown => {
      if ((typeof value === 'string')) {
        if (value === '') {
          return options![0].value;
        } else {
          return parseInt(value);
        }
      } else {
        return value;
      }
    };
    return transformValue() === radioValue;
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
