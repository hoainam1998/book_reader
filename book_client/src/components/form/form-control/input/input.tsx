import {
  ChangeEvent,
  JSX,
  useRef,
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  Ref,
  FormEvent,
  HTMLProps
} from 'react';
import FormControl from '../form-control';
import { clsx, customError } from 'utils';
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
  max?: number;
  min?: number | string;
  // eslint-disable-next-line no-unused-vars
  onChange?: <T>(event: ChangeEvent<T>) => void;
  onInput?: <T>(event: FormEvent<T>) => void;
  onFocus?: () => void;
  onBlur?: (value: number | string) => void;
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
  max,
  min,
  className,
  labelClass,
  inputClass,
  onChange = () => {},
  onInput = () => {},
  onFocus = () => {},
  onBlur = () => {}
}: InputPropsType, ref: Ref<InputRefType>): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [targetValue, setTargetValue] = useState<string>('');

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
      defaultValue: value as string | number,
    };
  }, [type, value, accept, multiple]);

  const limitCharacter: string = useMemo(() => {
    return max ? `${targetValue.length}/${max}` : '';
  }, [targetValue, max]);

  const onChangeEvent = (event: ChangeEvent<HTMLInputElement>): void => {
    if (typeof event.target.value === 'string') {
      setTargetValue(event.target.value);
    }
    onChange(event);
  };

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
        throw customError("Value of input type file must be file, file list or empty string ('')!");
      }
    }
  }, [value, type]);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass} errors={errors}>
      <div className={clsx('input-wrapper', inputClass)}>
        <input id={name} name={name} className={clsx('input custom-input', { 'error-input': error })}
          type={type} {...specificPropInput} multiple={multiple} min={min} ref={inputRef}
          onChange={onChangeEvent} onInput={onInput} onFocus={onFocus} onBlur={(e) => onBlur(e.target.value)} />
        {limitCharacter && <p className="limit">{limitCharacter}</p>}
      </div>
    </FormControl>
  );
}

export default forwardRef(Input);
