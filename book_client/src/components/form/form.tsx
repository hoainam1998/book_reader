import React, { JSX } from 'react';
import { FetcherWithComponents, useFetcher } from 'react-router-dom';
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
  onSubmit: (fetcher: FetcherWithComponents<any>) => void;
};

function Form({
  children,
  className,
  submitLabel = 'Submit',
  disableSubmitButton = false,
  method,
  onSubmit
}: FormProps): JSX.Element {
  const fetcher = useFetcher();

  const handleSubmit = () => onSubmit(fetcher);

  return (
    <fetcher.Form method={method}
      className={clsx('form', className)}
      encType="multipart/form-data">
      {children}
      <Button className="btn-submit" onClick={handleSubmit} disabled={disableSubmitButton}>{submitLabel}</Button>
    </fetcher.Form>
  );
}

export default Form;
