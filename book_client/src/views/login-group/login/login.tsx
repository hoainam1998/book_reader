import { JSX, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginWrapper from 'components/login-wrapper/login-wrapper';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email } from 'hooks/useValidate';
import auth from 'store/auth';
import { login } from './fetcher';
import path from 'paths';
import { showToast } from 'utils';
import './style.scss';

type LoginFieldType = {
  email: string;
  password: string;
};

const state: LoginFieldType = {
  email: '',
  password: ''
};

const rules: RuleType<LoginFieldType> = {
  email: { required, email },
  password: { required }
};

const formId: string = 'login-form';

function Login(): JSX.Element {
  const {
    email,
    password,
    handleSubmit,
    validate
  } = useForm<LoginFieldType, RuleType<LoginFieldType>>(state, rules, formId);
  const navigate = useNavigate();

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      login(email.value, password.value)
        .then(res => {
          auth.saveUserLogin(res.data.user.login);
          if (res.data.user.login.mfaEnable === false) {
            auth.saveApiKey(res.data.user.login.apiKey);
            navigate(path.HOME);
          } else {
            navigate(path.OTP);
          }
        })
        .catch(error => showToast('OTP', error.response.data.message));
    }
  }, [email.value, password.value]);

  return (
    <LoginWrapper>
      <Form id={formId} onSubmit={onSubmit} submitLabel="Login">
        <Input {...email} label="Email" type="email" name="email" className="fieldset-class" />
        <Input {...password} label="Password" type="password" name="password" className="fieldset-class" />
      </Form>
    </LoginWrapper>
  );
}

export default Login;
