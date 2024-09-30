import { JSX, ReactElement, forwardRef, useRef, useImperativeHandle, Ref, ReactNode } from 'react';
import { clsx } from 'utils';
import './style.scss';

type FormControlProps = {
  children?: ReactElement;
  name: string;
  label: ReactNode;
  className?: string;
  labelClass?: string;
  errors: string[];
};

function FormControl<T>({
  label,
  name,
  children,
  errors = [],
  className,
  labelClass
}: FormControlProps, ref: Ref<T>): JSX.Element {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  useImperativeHandle(
    ref,
    (): T => ({ rect: fieldsetRef.current!.getBoundingClientRect() }) as T,
    []
  );

  return (
    <fieldset className={clsx('fieldset', className)} ref={fieldsetRef}>
      {label && <label htmlFor={name} className={labelClass}>{label}</label>}
      {children}
      <div className="error-feedback">
        { errors.map((error, index) => <span key={index}>{error}</span>) }
      </div>
    </fieldset>
  );
}

export default forwardRef(FormControl);
