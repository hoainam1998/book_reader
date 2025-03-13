import { JSX, ReactElement } from 'react';
import './style.scss';

type ClientLoginWrapperPropsType = {
  children: ReactElement;
};

function ClientLoginWrapper({ children }: ClientLoginWrapperPropsType): JSX.Element {
  return (
    <section className="client-login-wrapper flex-center">
      <div className="client-login">
        {children}
      </div>
    </section>
  );
}

export default ClientLoginWrapper;
