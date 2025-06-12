import { JSX, useMemo, useEffect, useState, useCallback } from 'react';
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
  const [originalValue, setOriginalValue] = useState<RadioPropsType<T>['value']>(value);

  const valueTransformed = useMemo<T>(() => {
    if ((typeof originalValue === 'string')) {
      return (originalValue === '' ? options![0].value: parseInt(originalValue)) as T;
    }
    return originalValue!;
  }, [originalValue]);

  const radioOnChange = useCallback((event: any): void => {
    setOriginalValue(event.target.value);
    onChange && onChange(event.target.checked);
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
