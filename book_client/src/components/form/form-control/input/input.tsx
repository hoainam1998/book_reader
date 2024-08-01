import { ChangeEvent, FormEventHandler, JSX } from 'react';
import FormControl from '../form-control';
import { clsx } from 'utils';
import './style.scss';

type InputProps = {
  type: string;
  label: string;
  className?: string;
  labelClass?: string;
  inputClass?: string;
  name: string;
  value: string;
  errors: string[];
  error: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange: <T>(event: ChangeEvent<T>) => void;
  onInput: FormEventHandler;
  onFocus: () => void;
};

function Input({
  type,
  label,
  name,
  value,
  errors,
  error,
  className,
  labelClass,
  onChange,
  onInput,
  onFocus,
}: InputProps): JSX.Element {
  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass} errors={errors}>
      <input id={name} name={name} className={clsx('input custom-input', { 'error-input': error })}
        type={type} autoComplete="off" defaultValue={value}
        onChange={onChange<HTMLInputElement>} onInput={onInput} onFocus={onFocus} />
    </FormControl>
  );
}

export default Input;
