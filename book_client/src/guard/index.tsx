import { JSX, useCallback } from 'react';
import path from 'router/paths';
import { Navigate, useMatch } from 'react-router-dom';
import auth from 'store/auth';
import { generateResetPasswordLink } from 'utils';

type GuardPropsType = {
  children : JSX.Element;
};

export const LoginRequire = ({ children }: GuardPropsType): JSX.Element => {
  const checkCurrentRoute = useCallback((path: string): boolean => !!useMatch(path), []);

  if (auth.IsLogged) {
    if (auth.MfaEnable) {
      if (auth.MfaValidated) {
        if (!checkCurrentRoute(`${path.HOME}/*`)) {
          return <Navigate to={path.HOME} />;
        }
        return children;
      } else {
        if (!checkCurrentRoute(path.OTP)) {
          return <Navigate to={path.OTP} />;
        }
        return children;
      }
    }
    return children;
  }

  if (auth.PasswordMustChange && auth.ResetPasswordToken) {
    if (!checkCurrentRoute(path.RESET_PASSWORD)) {
      return <Navigate to={generateResetPasswordLink(auth.ResetPasswordToken)} />;
    }
    return children;
  }

  if (!checkCurrentRoute(path.LOGIN)) {
    return <Navigate to={path.LOGIN} />;
  }
  return children;
};
