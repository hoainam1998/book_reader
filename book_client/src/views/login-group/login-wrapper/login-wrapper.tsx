import { JSX, ReactElement } from 'react';
import './style.scss';

type LoginWrapperPropsType = {
  children: ReactElement;
};

function LoginWrapper({ children }: LoginWrapperPropsType): JSX.Element {
  return (
    <section className="login-wrapper">
      <img src={require('images/book.png')} className="logo" alt="logo" />
      <div className="form-box">{children}</div>
    </section>
  );
}

export default LoginWrapper;
