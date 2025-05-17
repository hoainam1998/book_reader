import { Fragment, JSX, useMemo } from 'react';
import FormControl, { FormControlProps } from '../form-control';
import { FieldValidateProps } from 'hooks/useForm';
import './style.scss';

type SwitchPropsType = FormControlProps
  & Partial<Omit<FieldValidateProps<boolean>, 'validate' | 'onInput' | 'watch'>>
  & {
    checkValue?: string | number,
    notCheckValue?: string | number;
  };

function Switch({
  name,
  value = false,
  label,
  className,
  labelClass,
  checkValue,
  notCheckValue,
  onChange
}: SwitchPropsType): JSX.Element {

  const valueConverted = useMemo<string>(() => {
    if (checkValue && notCheckValue) {
      return (value === true ? checkValue : notCheckValue).toString();
    }
    return (value || false).toString();
  }, [checkValue, notCheckValue, value]);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass}>
      <Fragment>
        <label className="switch">
          <input type="checkbox" checked={value} value={value!.toString()}
            onChange={(event) => onChange!(event.target.checked)} />
          <span className="slider" />
        </label>
        <input type="hidden" name={name} value={valueConverted} />
      </Fragment>
    </FormControl>
  );
}

export default Switch;
