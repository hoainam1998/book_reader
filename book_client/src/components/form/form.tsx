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

  const enterKeyEvent = useCallback((event: any): void => {
    if (event.code === 'Enter') {
      event.preventDefault();
      onSubmit(new FormData((event.target as HTMLFormElement).form));
    }
  }, [onSubmit]);

  return (
    <form
      id={id}
      className={clsx('form', className)}
      data-testid="form"
      encType="multipart/form-data"
      onKeyDown={enterKeyEvent}>
        {children}
        <Button
          className={clsx('btn-save', submitBtnClass)}
          variant="submit"
          onClick={handleSubmit}
          disabled={disableSubmitButton}>
            {submitLabel}
        </Button>
    </form>
  );
}

export default Form;
