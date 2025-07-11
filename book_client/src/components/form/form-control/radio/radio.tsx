import { JSX, useMemo, useEffect, useCallback } from 'react';
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
  className,
  options,
  horizontal,
  inputColumnSize,
  labelColumnSize,
  onChange,
  onFocus,
  watch,
}: RadioPropsType<T>): JSX.Element {
  const valueTransformed = useMemo<T>(() => {
    if ((typeof value === 'string')) {
      return (value === '' ? options![0].value: parseInt(value)) as T;
    }
    return value!;
  }, [value]);

  const radioOnChange = useCallback((event: any): void => {
    onChange && onChange(event.target.value);
  }, []);

  useEffect(() => {
    if (watch) {
      watch(valueTransformed);
    }
  }, [valueTransformed]);

  return (
    <FormControl
      name={name}
      className={className}
      label={label}
      inputColumnSize={inputColumnSize}
      labelColumnSize={labelColumnSize}>
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
                      onChange={radioOnChange}
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
