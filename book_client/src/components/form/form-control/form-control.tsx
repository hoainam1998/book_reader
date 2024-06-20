import './style.scss';

type FormControl = {
  children?: React.ReactElement;
  name: string;
  label?: {
    class?: string;
    text: string;
  };
  errors: string[];
};

function FormControl({ label, name, children, errors }: FormControl): JSX.Element {
  return (
    <fieldset className="fieldset">
      {label && <label htmlFor={name} className={label.class}>{label.text}</label>}
      {children}
      <div className="error-feedback">
        { errors.map((error, index) => <span key={index}>{error}</span>) }
      </div>
    </fieldset>
  );
}

export default FormControl;
