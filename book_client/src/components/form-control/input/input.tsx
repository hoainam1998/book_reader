import { ChangeEvent } from 'react';
import './style.scss';

type InputProps = {
  type: string;
  label?: {
    class?: string;
    text: string;
  };
  name: string;
  value: string;
  // eslint-disable-next-line no-unused-vars
  onChange: <T>(event: ChangeEvent<T>) => void
};

function Input({ type, label, name, value, onChange }: InputProps): JSX.Element {
  return (
    <fieldset className="fieldset">
      {label && <label htmlFor={name} className={label.class}>{label.text}</label>}
      <input name={name} className="input custom-input" defaultValue={value}
        type={type} onChange={onChange<HTMLInputElement>} />
    </fieldset>
  );
}

export default Input;
