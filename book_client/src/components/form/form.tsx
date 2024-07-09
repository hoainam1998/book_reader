/* eslint-disable no-unused-vars */
import React, { JSX } from 'react';
import Button from 'components/button/button';
import { clsx } from 'utils';
import './style.scss';

type FormProps = {
  className?: string;
  children: React.ReactElement[] | React.ReactElement;
  submitLabel: string;
  disableSubmitButton?: boolean;
  method: 'post' | 'put';
  // eslint-disable-next-line no-unused-vars,
  onSubmit: (formData: FormData) => void;
};

function Form({
  children,
  className,
  submitLabel = 'Submit',
  disableSubmitButton = false,
  method,
  onSubmit
}: FormProps): JSX.Element {

  const handleSubmit = (event: any) => {
    (event as Event).preventDefault();
    onSubmit(new FormData((event.target as HTMLFormElement).form));
  };

  return (
    <form method={method}
      className={clsx('form', className)}
      encType="multipart/form-data">
      {children}
      <Button className="btn-submit" onClick={handleSubmit} disabled={disableSubmitButton}>{submitLabel}</Button>
    </form>
  );
}

export default Form;
