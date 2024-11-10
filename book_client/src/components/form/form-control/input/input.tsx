/* eslint-disable no-unused-vars */
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
  HTMLProps,
  useCallback
} from 'react';
import FormControl from '../form-control';
import type { FormControlProps } from '../form-control';
import { clsx, customError } from 'utils';
import './style.scss';

export type InputRefType = {
  input: HTMLInputElement | null;
};

type InputPropsType = {
  type?: string;
  inputClass?: string;
  value?: string | number | File | File [];
  error?: boolean;
  accept?: string;
  multiple?: boolean;
  max?: number;
  min?: number | string;
  onChange?: <T>(event: ChangeEvent<T>) => void;
  onInput?: <T>(event: FormEvent<T>) => void;
  onFocus?: () => void;
  onBlur?: (value: number | string) => void;
} & Omit<FormControlProps, 'children'>;

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
  labelColumnSize,
  inputColumnSize,
  onChange = () => {},
  onInput = () => {},
  onFocus = () => {},
  onBlur = () => {}
}: InputPropsType, ref: Ref<InputRefType>): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputType, setInputType] = useState<string>(type);
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

  const toggleChangeInputType = useCallback((event: any) => {
    event.preventDefault();
    const inputTypeUpdated = inputType === 'password' ? 'text' : 'password';
    setInputType(inputTypeUpdated);
  }, [inputType]);

  useEffect(() => {
    if (value !== null && value !== undefined && type === 'file') {
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
        throw customError('Value of input type file must be file, file list or empty string (\'\')!');
      }
    } else {
      inputRef.current!.value = value as string;
    }
  }, [value, type]);

  return (
    <FormControl
      labelColumnSize={labelColumnSize}
      inputColumnSize={inputColumnSize}
      name={name}
      label={label}
      className={className}
      labelClass={labelClass}
      errors={errors}>
        <div className={clsx('input-wrapper', inputClass)}>
          <input id={name} name={name} className={clsx('input custom-input', { 'error-input': error })}
            type={inputType} {...specificPropInput} multiple={multiple}
            min={min} ref={inputRef} data-testid={`input-${name}`}
            onChange={onChangeEvent} onInput={onInput} onFocus={onFocus} onBlur={(e) => onBlur(e.target.value)} />
          {
            type === 'password' &&
            <button onClick={toggleChangeInputType} className="eye-button">
              <img src={require('images/icons/eye.svg')} alt="eye-icon" />
            </button>
          }
          {limitCharacter && <p className="limit">{ limitCharacter }</p>}
        </div>
    </FormControl>
  );
}

export default forwardRef(Input);
