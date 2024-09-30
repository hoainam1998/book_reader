import { forwardRef, useImperativeHandle, useRef, useMemo, JSX, Ref } from 'react';
import FormControl from 'components/form/form-control/form-control';
import { format } from 'date-fns';
import { clsx } from 'utils';
import './style.scss';

type InputCalendarRect = {
  rect: DOMRect;
};

type InputCalendarProps = {
  label: string;
  className?: string;
  labelClass?: string;
  inputClass?: string;
  name: string;
  value: number | null;
  errors: string[];
  error: boolean;
  onFocus: () => void;
  onOpen: () => void;
};

function InputCalendar({
  name,
  label,
  className,
  labelClass,
  inputClass,
  errors,
  error,
  value,
  onFocus,
  onOpen
  }: InputCalendarProps, ref: Ref<InputCalendarRect>): JSX.Element {
  const inputCalendarRef = useRef<InputCalendarRect>(null);
  const dateFormatted: string = useMemo(() => value ? format(value, 'dd-MM-yyyy') : '', [value]);

  useImperativeHandle(ref, () => ({ rect: inputCalendarRef.current!.rect as DOMRect }), []);

  return (
    <FormControl<InputCalendarRect> name={name} label={label} className={className} labelClass={labelClass} errors={errors} ref={inputCalendarRef}>
      <div className={clsx('input-calendar custom-input', { 'error-input': error })} onClick={onOpen}>
        <input name={name} id={name} type="text" readOnly className={clsx('input', inputClass)}
          autoComplete="off" onFocus={onFocus} value={dateFormatted} />
        <img src={require('images/icons/calendar.png')} alt="calendar-icon" />
      </div>
    </FormControl>
  );
}

export default forwardRef(InputCalendar);
