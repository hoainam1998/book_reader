import { JSX, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <section className="client-login-wrapper flex-center">
      <div className="client-login">
        <LoginForm className="client-login-form" submitBtnClass='submit-btn-class' onLogin={onSubmit} />
      </div>
    </section>
  );
}

export default AdminLogin;
