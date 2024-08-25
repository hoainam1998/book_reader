import {
  ChangeEvent,
  JSX,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef,
  Ref,
  FormEvent,
  HTMLProps
} from 'react';
import FormControl from '../form-control';
import { clsx } from 'utils';
import './style.scss';

export type InputRefType = {
  input: HTMLInputElement | null;
};

type InputPropsType = {
  type?: string;
  label: string;
  className?: string;
  labelClass?: string;
  inputClass?: string;
  name: string;
  value?: string | number;
  errors?: string[];
  error?: boolean;
  accept?: string;
  multiple?: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange?: <T>(event: ChangeEvent<T>) => void;
  onInput?: <T>(event: FormEvent<T>) => void;
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
}: InputPropsType, ref: Ref<InputRefType>): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    (): InputRefType => ({ input: inputRef.current }),
    []
  );

  const specificPropInput: HTMLProps<HTMLInputElement> = useMemo(() => {
    return type === 'file' ? {
      accept,
      multiple
    } :
    {
      autoComplete: 'off',
      defaultValue: value
    };
  }, [type, value, accept, multiple]);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass} errors={errors}>
      <input id={name} name={name} className={clsx('input custom-input', { 'error-input': error }, inputClass)}
        type={type} {...specificPropInput} multiple={multiple} ref={inputRef}
        onChange={onChange} onInput={onInput} onFocus={onFocus} />
    </FormControl>
  );
}

export default forwardRef(Input);
