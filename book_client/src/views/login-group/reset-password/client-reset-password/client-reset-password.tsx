import { JSX, useCallback } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import ClientLoginWrapper from 'views/login-group/login-wrapper/client-login-wrapper/client-login-wrapper';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email, matchPattern, sameAs, notSameWith } from 'hooks/useValidate';
import { getResetPasswordToken, resetPassword } from './fetcher';
import constants from 'read-only-variables';
import { ResetPasswordFieldType } from 'interfaces';
import { showToast } from 'utils';
import { logout } from 'views/login-group/login/client-login/fetcher';
import auth from 'store/auth';
import paths from 'router/paths';

const state: ResetPasswordFieldType = {
  email: '',
  oldPassword: '',
  password: '',
  passwordAgain: '',
};

const rules: RuleType<ResetPasswordFieldType> = {
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

function ClientResetPassword(): JSX.Element {
  const navigate = useNavigate();
  const { email, oldPassword, password, passwordAgain, handleSubmit, reset, validate } = useForm<
  ResetPasswordFieldType,
    RuleType<ResetPasswordFieldType>
  >(state, rules, formId);
  const token: string = useLoaderData() as string;

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

      const handleResetPassword = () => {
        resetPassword(body)
          .then((response) => {
            navigate(paths.LOGIN);
            showToast('Reset password!', response.data.message);
          })
          .catch((error) => showToast('Reset password!', error.response.data.message))
          .finally(reset);
      };

      if (auth.PasswordMustChange) {
        logout()
          .then(() => {
            auth.logout();
            handleResetPassword();
          })
          .catch(() => showToast('Reset password!', 'Reset password was failed!. Something wrong are happening!'))
          .finally(reset);
        } else {
          handleResetPassword();
        }
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
export {
  getResetPasswordToken
};
