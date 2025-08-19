import { JSX, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLoginWrapper from 'views/login-group/login-wrapper/admin-login-wrapper/admin-login-wrapper';
import LoginForm from '../login-form/login-form';
import { login } from './fetcher';
import auth from 'store/auth';
import canSignup from 'store/can-signup';
import path from 'router/paths';
import { showToast, generateResetPasswordLink } from 'utils';
import './style.scss';

function AdminLogin(): JSX.Element {
  const navigate = useNavigate();

  const onSubmit = useCallback((email: string, password: string, reset: () => void): void => {
    login(email, password)
      .then((res) => {
        const userLogin = { ...res.data };
        delete userLogin.apiKey;
        auth.saveUserLogin(userLogin);
        if (res.data.passwordMustChange) {
          navigate(generateResetPasswordLink(res.data.resetPasswordToken));
        } else {
          auth.IsLogged = true;
          if (res.data.mfaEnable === false) {
            auth.saveApiKey(res.data.apiKey);
            navigate(path.HOME);
          } else {
            navigate(path.OTP);
          }
        }
      })
      .catch((error) => showToast('Login!', error.response.data.message))
      .finally(reset);
  }, []);

  return (
    <AdminLoginWrapper>
      <>
        <LoginForm onLogin={onSubmit} />
        <div className="footer-links">
          <Link className="footer-link" to={path.FORGET_PASSWORD}>Forget password?</Link>
          { canSignup.CanSignup && <Link className="footer-link" to={path.SIGN_UP}>Signup?</Link> }
        </div>
      </>
    </AdminLoginWrapper>
  );
}

export default AdminLogin;
