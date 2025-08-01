import { JSX, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ClientLoginWrapper from 'views/login-group/login-wrapper/client-login-wrapper/client-login-wrapper';
import LoginForm from '../login-form/login-form';
import auth from 'store/auth';
import { login } from './fetcher';
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
          auth.saveApiKey(res.data.apiKey);
          navigate(path.HOME);
        }
      })
      .catch((error) => showToast('Login!', error.response.data.message))
      .finally(reset);
  }, []);

  return (
    <ClientLoginWrapper name="login">
      <LoginForm className="client-login-form" onLogin={onSubmit}>
        <div className="link-groups">
          <Link to={path.SIGN_UP} className="navigate-link">
            Sign up!
          </Link>
          <Link to={path.FORGET_PASSWORD} className="navigate-link">
            Forget your password?
          </Link>
        </div>
      </LoginForm>
    </ClientLoginWrapper>
  );
}

export default AdminLogin;
