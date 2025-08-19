import { JSX, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import AdminLoginWrapper from 'views/login-group/login-wrapper/admin-login-wrapper/admin-login-wrapper';
import { OptionPrototype } from 'components/form/form-control/form-control';
import Select from 'components/form/form-control/select/select';
import { email, required } from 'hooks/useValidate';
import useForm, { RuleType } from 'hooks/useForm';
import { signUp } from './fetcher';
import { showToast } from 'utils';
import canSignup from 'store/can-signup';
import constants from 'read-only-variables';
import path from 'router/paths';

const sexOptions: OptionPrototype<number>[] = constants.SEX.map((label, index) => ({ label, value: index }));

type SingUpFieldType = {
  firstName: string;
  lastName: string;
  email: string;
  sex: number | string;
  phone: string;
};

const state: SingUpFieldType = {
  firstName: '',
  lastName: '',
  email: '',
  sex: '',
  phone: '',
};

const rules: RuleType<SingUpFieldType> = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  sex: { required },
  phone: { required },
};

const formId: string = 'signup-form';

function Signup(): JSX.Element {
  const navigate = useNavigate();
  const { firstName, lastName, email, phone, sex, handleSubmit, validate } = useForm<
    SingUpFieldType,
    RuleType<SingUpFieldType>
  >(state, rules, formId);

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      signUp(state)
        .then((response) => {
          showToast('Sign up!', response.data.message);
          canSignup.CanSignup = false;
          navigate(path.LOGIN);
        })
        .catch((error) => showToast('Sign up!', error.response.data.message));
    }
  }, []);

  return (
    <AdminLoginWrapper>
      <Form id={formId} onSubmit={onSubmit} submitLabel="Sign up">
        <Grid>
          <GridItem lg={5}>
            <Input
              {...firstName}
              labelColumnSize={{
                lg: 12
              }}
              inputColumnSize={{
                lg: 12
              }}
              label="First name"
              name="firstName"
            />
          </GridItem >
          <GridItem lg={7}>
            <Input
              {...lastName}
              labelColumnSize={{
                lg: 12
              }}
              inputColumnSize={{
                lg: 12
              }}
              label="Last name"
              name="lastName"
            />
          </GridItem>
          <GridItem lg={12}>
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
          </GridItem>
          <GridItem lg={12}>
            <Input
              {...phone}
              label="Phone"
              name="phone"
              labelColumnSize={{
                lg: 12
              }}
              inputColumnSize={{
                lg: 12
              }}
            />
          </GridItem>
          <GridItem lg={12}>
            <Select<number, OptionPrototype<number>>
              {...sex}
              label="Sex"
              name="sex"
              placeholder="Please select your gender!"
              selectClass="gender-box"
              options={sexOptions}
              labelColumnSize={{
                lg: 12
              }}
              inputColumnSize={{
                lg: 12
              }}
            />
          </GridItem>
        </Grid>
      </Form>
    </AdminLoginWrapper>
  );
}

export default Signup;
