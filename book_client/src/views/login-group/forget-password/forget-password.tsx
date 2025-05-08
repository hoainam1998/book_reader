import { JSX, useCallback } from 'react';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import AdminLoginWrapper from '../login-wrapper/admin-login-wrapper/admin-login-wrapper';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email } from 'hooks/useValidate';
import { showToast } from 'utils';
import { forgetPassword } from './fetcher';
import './style.scss';

type ForgetPasswordFieldType = {
  email: string;
};

const state: ForgetPasswordFieldType = {
  email: '',
};

const rules: RuleType<ForgetPasswordFieldType> = {
  email: { required, email },
};

const formId: string = 'forget-password-form';

function ForgetPassword(): JSX.Element {
  const { email, handleSubmit, reset, validate } = useForm<
  ForgetPasswordFieldType,
    RuleType<ForgetPasswordFieldType>
  >(state, rules, formId);

  const submit = useCallback(() => {
    handleSubmit();
    if (!validate.error) {
      console.log(email.value);
      forgetPassword({ email: email.value })
        .then((response) => showToast('Forget password!', response.data.message))
        .catch((error) => showToast('Forget password!', error.response.data.message))
        .finally(reset);
    }
  }, [email.value]);

  return (
    <AdminLoginWrapper>
      <Form id={formId} onSubmit={submit}>
        <Input
          {...email}
          label="Email"
          type="email"
          name="email"
          inputColumnSize={{
            lg: 12
          }} />
        </Form>
    </AdminLoginWrapper>
  );
}

export default ForgetPassword;
