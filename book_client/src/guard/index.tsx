import { JSX } from 'react';
import path from 'router/paths';
import { Navigate, useMatch } from 'react-router-dom';
import auth from 'store/auth';
import { generateResetPasswordLink } from 'utils';

type GuardPropsType = {
  children : JSX.Element;
};

export const LoginRequire = ({ children }: GuardPropsType): JSX.Element => {
  const isLogin = useMatch(path.LOGIN);
  const isHome = useMatch(`${path.HOME}/*`);
  const isOtp = useMatch(path.OTP);
  const isResetPassword = useMatch(path.RESET_PASSWORD);

  if (auth.IsLogged) {
    if (auth.MfaEnable) {
      if (auth.MfaValidated) {
        if (!isHome) {
          return <Navigate to={path.HOME} />;
        }
        return children;
      } else {
        if (!isOtp) {
          return <Navigate to={path.OTP} />;
        }
        return children;
      }
    }

    if (!isHome) {
      return <Navigate to={path.HOME} />;
    }
    return children;
  }

  if (auth.PasswordMustChange && auth.ResetPasswordToken) {
    if (!isResetPassword) {
      return <Navigate to={generateResetPasswordLink(auth.ResetPasswordToken)} />;
    }
    return children;
  }

  if (!isLogin) {
    return <Navigate to={path.LOGIN} />;
  }
  return children;
};
