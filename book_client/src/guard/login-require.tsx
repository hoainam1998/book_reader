import { JSX } from 'react';
import path from 'router/paths';
import { Navigate, useMatch } from 'react-router-dom';
import auth from 'store/auth';
import { GuardPropsType  } from './type';
import { generateResetPasswordLink } from 'utils';

const LoginRequire = ({ children }: GuardPropsType): JSX.Element => {
  const isLogin = useMatch(path.LOGIN);
  const isHome = useMatch(`${path.HOME}/*`);
  const isOtp = useMatch(path.OTP);
  const isPersonal = useMatch(path.PERSONAL);
  const isResetPassword = useMatch(path.RESET_PASSWORD);
  const isSignup = useMatch(path.SIGN_UP);
  const isForgetPassword = useMatch(path.FORGET_PASSWORD);

  if (auth.IsLogged) {
    if (auth.MfaEnable) {
      if (auth.MfaValidated) {
        if (!isHome && !isPersonal) {
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

    if (!isHome && !isPersonal) {
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

  if (isSignup || isForgetPassword) {
    return children;
  }

  if (!isLogin) {
    return <Navigate to={path.LOGIN} />;
  }
  return children;
};

export default LoginRequire;
