/* eslint-disable no-unused-vars */
import React, { JSX, useCallback } from 'react';
import Button from 'components/button/button';
import { clsx } from 'utils';
import './style.scss';

type FormProps = {
  id: string;
  className?: string;
  children: React.ReactElement[] | React.ReactElement;
  submitLabel?: string;
  disableSubmitButton?: boolean;
  submitBtnClass?: string;
  // eslint-disable-next-line no-unused-vars,
  onSubmit: (formData: FormData) => void;
};

function Form({
  children,
  id,
  className,
  submitLabel = 'Submit',
  disableSubmitButton = false,
  submitBtnClass,
  onSubmit
}: FormProps): JSX.Element {

  const handleSubmit = useCallback((event: any): void => {
    (event as Event).preventDefault();
    onSubmit(new FormData((event.target as HTMLFormElement).form));
  }, [onSubmit]);

  return (
    <form id={id} className={clsx('form', className)} data-testid="form" encType="multipart/form-data">
      {children}
      <Button
        className={`btn-save ${submitBtnClass}`}
        variant="submit"
        onClick={handleSubmit}
        disabled={disableSubmitButton}>
          {submitLabel}
      </Button>
    </form>
  );
}

export default Form;
