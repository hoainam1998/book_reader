import { forwardRef, useImperativeHandle, useRef, useMemo, JSX } from 'react';
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
  value: Date;
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
  errors,
  error,
  value,
  onFocus,
  onOpen
  }: InputCalendarProps, ref: any): JSX.Element {
  const inputCalendarRef = useRef<InputCalendarRect>(null);

  useImperativeHandle(ref, () => {
    return {
      rect: inputCalendarRef.current!.rect as DOMRect
    };
  }, []);

  const dateFormatted: string = useMemo(() => format(value, 'dd-MM-yyyy'), [value]);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass} errors={errors} ref={inputCalendarRef}>
      <div className="input-calendar custom-input" onClick={onOpen}>
        <input name={name} id={name} type="text" readOnly className={clsx('input', { 'error-input': error })}
          autoComplete="off" onFocus={onFocus} value={dateFormatted} />
        <img src={require('images/icons/calendar.png')} alt="calendar-icon" />
      </div>
    </FormControl>
  );
}

export default forwardRef(InputCalendar);
