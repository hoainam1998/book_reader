/* eslint-disable no-unused-vars */
import { JSX, useCallback } from 'react';
import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import AdminLoginWrapper from 'views/login-group/login-wrapper/admin-login-wrapper/admin-login-wrapper';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email, matchPattern, sameAs } from 'hooks/useValidate';
import { ResetPasswordFieldType } from 'interfaces';
import constants from 'read-only-variables';
import paths from 'router/paths';

type ResetAdminPasswordFieldType = ResetPasswordFieldType & {
  oldPassword: string;
};

const state: ResetAdminPasswordFieldType = {
  email: '',
  oldPassword: '',
  password: '',
  passwordAgain: '',
};

const rules: RuleType<ResetAdminPasswordFieldType> = {
  email: { required, email },
  oldPassword: {
    required,
    matchPattern: matchPattern(constants.PASSWORD_PATTERN, 'Format password is wrong!')
  },
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

function AdminResetPassword(): JSX.Element {
  const { email, oldPassword, password, passwordAgain, handleSubmit, reset, validate } = useForm<
  ResetAdminPasswordFieldType,
    RuleType<ResetAdminPasswordFieldType>
  >(state, rules, formId);

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      // onLogin(email.value, password.value, reset);
    }
  }, []);

  return (
    <AdminLoginWrapper>
      <Form id={formId} onSubmit={onSubmit} submitLabel="Reset">
        <Input
          {...email}
          labelColumnSize={{
            lg: 12
          }}
          inputColumnSize={{
            lg: 12
          }}
          labelStyle={{
            marginBottom: 0
          }}
          label="Email"
          type="email"
          name="email"
        />
        <Input
          {...oldPassword}
          label="Old password"
          type="password"
          name="oldPassword"
          labelClass="label-input-style"
          labelStyle={{
            marginBottom: 0
          }}
          labelColumnSize={{
            lg: 12
          }}
          inputColumnSize={{
            lg: 12
          }}
        />
        <Input
          {...password}
          label="Password"
          type="password"
          name="password"
          labelStyle={{
            marginBottom: 0
          }}
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
          labelStyle={{
            marginBottom: 0
          }}
          labelColumnSize={{
            lg: 12
          }}
          inputColumnSize={{
            lg: 12
          }}
        />
      </Form>
    </AdminLoginWrapper>
  );
}

export default AdminResetPassword;

export const getResetPasswordToken = ({ request }: LoaderFunctionArgs): string | Response => {
  const url: URL = new URL(request.url);
  const token: string | null = url.searchParams.get('token');
  return token || redirect(paths.LOGIN);
};
