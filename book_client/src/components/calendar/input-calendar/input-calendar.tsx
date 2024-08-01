import { forwardRef, useImperativeHandle, useRef, useMemo, JSX } from 'react';
import FormControl from 'components/form/form-control/form-control';
import { format } from 'date-fns';

import { clsx } from 'utils';
import './style.scss';

type InputCalendatRect = {
  rect: DOMRect;
};

type InputCalendarProps = {
  label: string;
  className?: string;
  labelClass?: string;
  inputClass?: string;
  name: string;
  value: string;
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
  const inputCalendarRef = useRef<InputCalendatRect>(null);

  useImperativeHandle(ref, () => {
    return {
      rect: inputCalendarRef.current!.rect as DOMRect
    };
  }, []);

  const dateFormated: string = useMemo(() => format(value, 'yyyy-MM-dd'), [value]);

  return (
    <FormControl name={name} label={label} className={className} labelClass={labelClass} errors={errors} ref={inputCalendarRef}>
      <div className="input-calendar custom-input" onClick={onOpen}>
        <input name={name} type="text" readOnly className={clsx('input', { 'error-input': error })}
          autoComplete="off" onFocus={onFocus} value={dateFormated} />
        <img src={require('images/icons/calendar.png')} alt="calendar-icon" />
      </div>
    </FormControl>
  );
}

export default forwardRef(InputCalendar);
