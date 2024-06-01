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
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
};

function Input({ type, label, name, value, onChange }: InputProps): JSX.Element {
  return (
    <>
      {label && <label htmlFor={name} className={label.class}>{label.text}</label>}
      <input className="input custom-input" defaultValue={value}
        type={type} name={name} onChange={onChange} />
    </>
  );
}

export default Input;
