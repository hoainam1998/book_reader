import { JSX } from 'react';
import path from 'paths';
import { Navigate } from 'react-router-dom';
import auth from 'store/auth';

type GuardPropsType = {
  children : JSX.Element;
};

export const LoginRequire = ({ children }: GuardPropsType): JSX.Element => {
  if (auth.IsLogged) {
    return children;
  }
  return (<Navigate to={path.LOGIN} />);
};


export const Logged = ({ children }: GuardPropsType): JSX.Element => {
  if (!auth.IsLogged) {
    return children;
  }
  return (<Navigate to={path.HOME} />);
};
