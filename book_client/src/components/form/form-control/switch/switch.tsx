import { ChangeEvent, Fragment, JSX, useCallback, useEffect, useMemo, useState } from 'react';
import FormControl, { FormControlProps } from '../form-control';
import { FieldValidateProps } from 'hooks/useForm';
import './style.scss';

type SwitchPropsType = FormControlProps
  & Partial<Omit<
  FieldValidateProps<boolean>,
  'validate' | 'onInput' | 'value'>
  >
  & {
    checkValue?: string | number,
    notCheckValue?: string | number;
    value: string | boolean;
  };

function Switch({
  name,
  value = false,
  label,
  className,
  labelClass,
  checkValue,
  notCheckValue,
  onChange,
  onFocus,
  watch,
}: SwitchPropsType): JSX.Element {
  const [checked, setChecked] = useState<boolean>(false);

  const valueConverter = useCallback((checked: boolean | string): string => {
    const haveValidCustomValue = [checkValue, notCheckValue].every((labelValue) => labelValue != undefined);
    if (haveValidCustomValue) {
      if (typeof checked === 'boolean') {
        return (checked === true ? checkValue! : notCheckValue!).toString();
      }
      return (checked == checkValue ? checkValue! : notCheckValue!).toString();
    }
    return (checked || false).toString();
  }, [checkValue, notCheckValue]);

  const valueReverse = useMemo<boolean>(() => {
    if (checkValue && notCheckValue) {
      return (value as string) === checkValue;
    }
    return value as boolean;
  }, [value]);

  const valueConverted = useMemo<string>(() => valueConverter(checked), [checkValue, notCheckValue, checked]);

  const switchOnChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setChecked(event.target.checked);
    onChange && onChange(JSON.parse(valueConverter(event.target.checked)));
  }, [valueConverted]);

  useEffect(() => {
    if (watch) {
      watch(JSON.parse(valueConverter(value)));
    }
  }, []);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass}>
      <Fragment>
        <label className="switch">
          <input type="checkbox" checked={valueReverse} value={valueReverse!.toString()}
            onChange={switchOnChange} onFocus={onFocus} />
          <span className="slider" />
        </label>
        <input type="hidden" name={name} value={valueConverted} />
      </Fragment>
    </FormControl>
  );
}

export default Switch;
