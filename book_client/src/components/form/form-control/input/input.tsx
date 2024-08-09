import { ChangeEvent, FormEventHandler, JSX, useRef, useImperativeHandle, forwardRef } from 'react';
import FormControl from '../form-control';
import { clsx } from 'utils';
import './style.scss';

type InputProps = {
  type?: string;
  label: string;
  className?: string;
  labelClass?: string;
  inputClass?: string;
  name: string;
  value?: string;
  errors?: string[];
  error?: boolean;
  accept?: string;
  multiple?: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange?: <T>(event: ChangeEvent<T>) => void;
  onInput?: FormEventHandler;
  onFocus?: () => void;
};

function Input({
  type = 'text',
  label,
  name,
  value = '',
  errors = [],
  error = false,
  accept = 'image/*',
  multiple = false,
  className,
  labelClass,
  inputClass,
  onChange = () => {},
  onInput = () => {},
  onFocus = () => {},
}: InputProps, ref: any): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => {
    return {
      input: inputRef.current
    };
  }, []);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass} errors={errors}>
      <input id={name} name={name} className={clsx('input custom-input', { 'error-input': error }, inputClass)}
        type={type} autoComplete="off" defaultValue={value} accept={accept} multiple={multiple} ref={inputRef}
        onChange={onChange<HTMLInputElement>} onInput={onInput} onFocus={onFocus} />
    </FormControl>
  );
}

export default forwardRef(Input);
