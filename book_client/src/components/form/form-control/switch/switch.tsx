import { JSX } from 'react';
import FormControl, { FormControlProps } from '../form-control';
import { FieldValidateProps } from 'hooks/useForm';
import './style.scss';

type SwitchPropsType = FormControlProps &
  Partial<Omit<FieldValidateProps<boolean>, 'validate' | 'onInput' | 'watch'>>;

function Switch({ name, value, label, className, labelClass, onChange }: SwitchPropsType): JSX.Element {
  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass}>
      <label className="switch">
        <input type="checkbox" name={name} checked={value} value={value!.toString()}
          onChange={(event) => onChange!(event.target.checked)} />
        <span className="slider" />
      </label>
    </FormControl>
  );
}

export default Switch;
