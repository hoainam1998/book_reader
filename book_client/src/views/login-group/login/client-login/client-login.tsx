import { JSX, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ClientLoginWrapper from 'views/login-group/login-wrapper/client-login-wrapper/client-login-wrapper';
import LoginForm from '../login-form/login-form';
import auth from 'store/auth';
import { login } from './fetcher';
import path from 'router/paths';
import { showToast } from 'utils';
import './style.scss';

function AdminLogin(): JSX.Element {
  const navigate = useNavigate();

  const onSubmit = useCallback((email: string, password: string, reset: () => void): void => {
    login(email, password)
      .then((res) => {
        const userLogin = { ...res.data };
        delete userLogin.apiKey;
        auth.saveUserLogin(userLogin);
        auth.saveApiKey(res.data.apiKey);
        if (res.data.mfaEnable === false) {
          navigate(path.HOME);
        } else {
          navigate(path.OTP);
        }
      })
      .catch((error) => showToast('OTP', error.response.data.message))
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
