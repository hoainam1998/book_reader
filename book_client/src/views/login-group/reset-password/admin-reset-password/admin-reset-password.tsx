/* eslint-disable no-unused-vars */
import { JSX, useCallback, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import AdminLoginWrapper from 'views/login-group/login-wrapper/admin-login-wrapper/admin-login-wrapper';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email, matchPattern, sameAs, notSameWith } from 'hooks/useValidate';
import { ResetPasswordFieldType } from 'interfaces';
import constants from 'read-only-variables';
import paths from 'router/paths';
import auth from 'store/auth';
import { showToast } from 'utils';
import { getResetPasswordToken, resetPassword } from './fetcher';

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
    notSameWith: notSameWith('oldPassword'),
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
  const token: string | undefined = useLoaderData() as string | undefined;
  const navigate = useNavigate();

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      const { email, password, oldPassword } = validate.values;
      const body = {
        email,
        password,
        oldPassword,
        resetPasswordToken: token,
      };

      resetPassword(body)
        .then((response) => {
          auth.destroyResetPasswordToken();
          reset();
          showToast('Reset password', response.data.message);
          navigate(paths.LOGIN);
        })
        .catch((error) => showToast('Reset password', error.response.data.message));
    }
  }, [validate.values]);

  useEffect(() => reset, []);

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

export {
  getResetPasswordToken
};
