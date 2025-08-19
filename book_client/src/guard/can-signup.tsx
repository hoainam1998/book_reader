import { JSX } from 'react';
import { GuardPropsType  } from './type';
import canSignup from 'store/can-signup';
import { Navigate } from 'react-router-dom';
import path from 'router/paths';

const CanSignup = ({ children }: GuardPropsType): JSX.Element => {
  if (canSignup.CanSignup) {
    return children;
  }
  return <Navigate to={path.LOGIN} />;
};

export default CanSignup;
