/* eslint-disable no-unused-vars */
import { JSX, useCallback } from 'react';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import ClientLoginWrapper from 'views/login-group/login-wrapper/client-login-wrapper/client-login-wrapper';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email, matchPattern, sameAs } from 'hooks/useValidate';
import constants from 'read-only-variables';
import { ResetPasswordFieldType } from 'interfaces';

const state: ResetPasswordFieldType = {
  email: '',
  password: '',
  passwordAgain: '',
};

const rules: RuleType<ResetPasswordFieldType> = {
  email: { required, email },
  password: {
    required,
    matchPattern: matchPattern(constants.PASSWORD_PATTERN, 'Format password is wrong!')
  },
  passwordAgain: {
    required,
    sameAs: sameAs('password'),
  },
};

const formId: string = 'login-form';

function ClientResetPassword(): JSX.Element {
  const { email, password, passwordAgain, handleSubmit, reset, validate } = useForm<
  ResetPasswordFieldType,
    RuleType<ResetPasswordFieldType>
  >(state, rules, formId);

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      // onLogin(email.value, password.value, reset);
    }
  }, []);

  return (
    <ClientLoginWrapper name="reset password">
      <Form id={formId} onSubmit={onSubmit} submitLabel="Reset">
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
        />
        <Input
          {...password}
          label="Password"
          type="password"
          name="password"
          labelColumnSize={{
            lg: 12
          }}
          inputColumnSize={{
            lg: 12
          }}
        />
        <Input
          {...passwordAgain}
          label="Password again"
          type="password"
          name="passwordAgain"
          labelColumnSize={{
            lg: 12
          }}
          inputColumnSize={{
            lg: 12
          }}
        />
      </Form>
    </ClientLoginWrapper>
  );
}

export default ClientResetPassword;
