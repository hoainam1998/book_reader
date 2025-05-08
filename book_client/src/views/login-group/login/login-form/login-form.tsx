import { JSX, ReactElement, useCallback } from 'react';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email, matchPattern } from 'hooks/useValidate';
import constants from 'read-only-variables';
import './style.scss';

type LoginFieldType = {
  email: string;
  password: string;
};

type LoginFormProps = {
  onLogin: (email: string, password: string, reset: () => void) => void;
  children?: ReactElement;
  className?: string;
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

function LoginForm({ className, children, onLogin }: LoginFormProps): JSX.Element {
  const { email, password, handleSubmit, reset, validate } = useForm<
    LoginFieldType,
    RuleType<LoginFieldType>
  >(state, rules, formId);

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      onLogin(email.value, password.value, reset);
    }
  }, [email.value, password.value]);

  return (
    <Form id={formId} onSubmit={onSubmit} className={className} submitLabel="Login">
      <Input
        {...email}
        labelColumnSize={{
          lg: 12
        }}
        inputColumnSize={{
          lg: 12
        }}
        label="Email"
        type="email"
        name="email"
        className="fieldset-class"
      />
      <Input
        {...password}
        label="Password"
        type="password"
        name="password"
        className="fieldset-class"
        labelColumnSize={{
          lg: 12
        }}
        inputColumnSize={{
          lg: 12
        }}
      />
      {children ?? <></>}
    </Form>
  );
}

export default LoginForm;
