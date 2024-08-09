/* eslint-disable no-unused-vars */
import React, { JSX } from 'react';
import Button from 'components/button/button';
import { clsx } from 'utils';
import './style.scss';

type FormProps = {
  id: string;
  className?: string;
  children: React.ReactElement[] | React.ReactElement;
  submitLabel: string;
  disableSubmitButton?: boolean;
  // eslint-disable-next-line no-unused-vars,
  onSubmit: (formData: FormData) => void;
};

function Form({
  children,
  id,
  className,
  submitLabel = 'Submit',
  disableSubmitButton = false,
  onSubmit
}: FormProps): JSX.Element {

  const handleSubmit = (event: any) => {
    (event as Event).preventDefault();
    onSubmit(new FormData((event.target as HTMLFormElement).form));
  };

  return (
    <form id={id} className={clsx('form', className)} encType="multipart/form-data">
      {children}
      <Button className="btn-save" variant="submit" onClick={handleSubmit} disabled={disableSubmitButton}>{submitLabel}</Button>
    </form>
  );
}

export default Form;
