import { JSX, ReactElement } from 'react';
import './style.scss';

type ClientLoginWrapperPropsType = {
  children: ReactElement;
  name: string;
};

function ClientLoginWrapper({ children, name }: ClientLoginWrapperPropsType): JSX.Element {
  return (
    <section className="client-login-wrapper flex-center">
      <div className="client-login">
        <h3 className="form-name">{name}</h3>
        {children}
      </div>
    </section>
  );
}

export default ClientLoginWrapper;
