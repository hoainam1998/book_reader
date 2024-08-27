import {
  ChangeEvent,
  JSX,
  useRef,
  useMemo,
  useEffect,
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
  value?: string | number | File | File [];
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
      multiple,
    } :
    {
      autoComplete: 'off',
      defaultValue: value as string | number
    };
  }, [type, value, accept, multiple]);

  useEffect(() => {
    if (value !== (null && undefined) && type === 'file') {
      if (Array.isArray(value)) {
        if (value.every(file => file instanceof File)) {
          const dataTransfer = new DataTransfer();
          value.map(v => dataTransfer.items.add(v));
          inputRef.current!.files = dataTransfer.files;
        }
      } else if (value instanceof File) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(value);
        inputRef.current!.files = dataTransfer.files;
      } else if (typeof value === 'string') {
        if (value === '') {
          inputRef.current!.value = value;
        }
      } else {
        throw new Error("[Custom Error] Value of input type file must be file, file list or empty string ('')!");
      }
    }
  }, [value, type]);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass} errors={errors}>
      <input id={name} name={name} className={clsx('input custom-input', { 'error-input': error }, inputClass)}
        type={type} {...specificPropInput} multiple={multiple} ref={inputRef}
        onChange={onChange} onInput={onInput} onFocus={onFocus} />
    </FormControl>
  );
}

export default forwardRef(Input);
