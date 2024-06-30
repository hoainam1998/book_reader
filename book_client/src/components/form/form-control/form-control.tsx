import { JSX, ReactElement } from 'react';
import { clsx } from 'utils';
import './style.scss';

type FormControlProps = {
  children?: ReactElement;
  name: string;
  label: string;
  className?: string;
  labelClass?: string;
  errors: string[];
};

function FormControl({ label, name, children, errors, className, labelClass }: FormControlProps): JSX.Element {
  return (
    <fieldset className={clsx('fieldset', className)}>
      {label && <label htmlFor={name} className={labelClass}>{label}</label>}
      {children}
      <div className="error-feedback">
        { errors.map((error, index) => <span key={index}>{error}</span>) }
      </div>
    </fieldset>
  );
}

export default FormControl;
