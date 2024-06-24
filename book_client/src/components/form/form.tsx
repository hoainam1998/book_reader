import Button from 'components/button/button';
import { clsx } from 'utils';
import './style.scss';

type FormProps = {
  id: string;
  className?: string;
  children: React.ReactElement[] | React.ReactElement;
  submitLabel: string;
  disableSubmitButton?: boolean;
  submit: () => void;
};

function Form({
  children,
  id,
  className,
  submitLabel = 'Submit',
  disableSubmitButton = false,
  submit
}: FormProps): JSX.Element {

  const handleSubmit = (event: any) => {
    event.preventDefault();
    submit();
  };

  return (
    <form id={id} className={clsx('form', className)}>
      {children}
      <Button className="btn-submit" onClick={handleSubmit} disabled={disableSubmitButton}>{submitLabel}</Button>
    </form>
  );
}

export default Form;
