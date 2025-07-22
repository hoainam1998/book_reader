import { forwardRef, useImperativeHandle, useRef, useMemo, JSX, Ref } from 'react';
import FormControl, { FormControlProps } from 'components/form/form-control/form-control';
import { clsx, formatDate } from 'utils';
import './style.scss';


type InputCalendarProps = {
  inputClass?: string;
  value: number | null;
  error: boolean;
  onFocus: () => void;
  onOpen: () => void;
} & Omit<FormControlProps, 'children'>;

function InputCalendar({
  name,
  label,
  className,
  labelClass,
  inputClass,
  errors,
  error,
  value,
  labelColumnSize,
  inputColumnSize,
  onFocus,
  onOpen,
  }: InputCalendarProps, ref: Ref<HTMLElement>): JSX.Element {
  const inputCalendar = useRef<HTMLElement>(null);
  const dateFormatted: string = useMemo(() => value ? formatDate(value) : '', [value]);

  useImperativeHandle(
    ref,
    (): HTMLElement => inputCalendar.current!,
    []
  );

  return (
    <FormControl
      name={name}
      label={label}
      className={className}
      labelClass={labelClass}
      errors={errors}
      labelColumnSize={labelColumnSize}
      inputColumnSize={inputColumnSize}
      ref={inputCalendar}>
        <div className={clsx('input-calendar custom-input', { 'error-input': error })} onClick={onOpen}>
          <input name={name} id={name} type="text" readOnly className={clsx('input', inputClass)}
            autoComplete="off" onFocus={onFocus} value={dateFormatted} />
          <img src={require('images/icons/calendar.png')} alt="calendar-icon" />
        </div>
    </FormControl>
  );
}

export default forwardRef(InputCalendar);
