import { JSX, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginWrapper from 'components/login-wrapper/login-wrapper';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email, matchPattern } from 'hooks/useValidate';
import auth from 'store/auth';
import { login } from './fetcher';
import path from 'paths';
import { showToast } from 'utils';
import constants from 'read-only-variables';
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
  password: {
    required,
    matchPattern: matchPattern(constants.PASSWORD_PATTERN, 'Format password is wrong!')
  }
};

const formId: string = 'login-form';

function Login(): JSX.Element {
  const {
    email,
    password,
    handleSubmit,
    reset,
    validate
  } = useForm<LoginFieldType, RuleType<LoginFieldType>>(state, rules, formId);
  const navigate = useNavigate();

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      login(email.value, password.value)
        .then(res => {
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
        .catch(error => showToast('OTP', error.response.data.message))
        .finally(reset);
    }
  }, [email.value, password.value]);

  return (
    <LoginWrapper>
      <Form id={formId} onSubmit={onSubmit} submitLabel="Login">
        <Input
          {...email}
          labelColumnSize={{
            lg: 12,
          }}
          inputColumnSize={{
            lg: 12
          }}
          label="Email"
          type="email"
          name="email"
          className="fieldset-class" />
        <Input
          {...password}
          label="Password"
          type="password"
          name="password"
          className="fieldset-class"
          labelColumnSize={{
            lg: 12,
          }}
          inputColumnSize={{
            lg: 12
          }} />
      </Form>
    </LoginWrapper>
  );
}

export default Login;
