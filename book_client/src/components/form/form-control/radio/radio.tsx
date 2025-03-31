/* eslint-disable no-unused-vars */
import { JSX,  useEffect, useMemo } from 'react';
import FormControl, { FormControlProps, OptionPrototype } from '../form-control';
import List from 'components/list/list';
import { FieldValidateProps } from 'hooks/useForm';
import { clsx } from 'utils';
import './style.scss';

type RadioPropsType<T> = {
  horizontal?: boolean;
  onChange: (value: unknown) => void;
} & Partial<Omit<FieldValidateProps<T>, 'onChange'>> & FormControlProps;

function Radio<T extends string | number>({
  name,
  value,
  label,
  options,
  horizontal,
  inputColumnSize,
  labelColumnSize,
  onChange,
  onFocus
}: RadioPropsType<T>): JSX.Element {

  const valueTransformed = useMemo<T>(() => {
    if ((typeof value === 'string')) {
      return (value === '' ? options![0].value: parseInt(value)) as T;
    }
    return value!;
  }, [value]);

  useEffect(() => {
    onChange!(valueTransformed);
  }, []);

  return (
    <FormControl name={name} label={label} inputColumnSize={inputColumnSize} labelColumnSize={labelColumnSize}>
      <ul className={clsx(horizontal && 'horizontal')}>
        <List<OptionPrototype<T>>
          items={options as OptionPrototype<T>[]}
          render={(item) => {
            return (
              <li>
                <label className="radio-wrapper">
                  <input
                    type="radio"
                    name={name}
                    value={item.value}
                    checked={item.value === valueTransformed}
                    onChange={onChange!}
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
