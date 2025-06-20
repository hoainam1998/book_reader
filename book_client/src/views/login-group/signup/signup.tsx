import { JSX, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import ClientLoginWrapper from 'views/login-group/login-wrapper/client-login-wrapper/client-login-wrapper';
import { OptionPrototype } from 'components/form/form-control/form-control';
import Select from 'components/form/form-control/select/select';
import { email, matchPattern, required, sameAs } from 'hooks/useValidate';
import useForm, { RuleType } from 'hooks/useForm';
import { signUp } from './fetcher';
import { showToast } from 'utils';
import constants from 'read-only-variables';
import path from 'router/paths';
import './style.scss';

const sexOptions: OptionPrototype<number>[] = constants.SEX.map((label, index) => ({ label, value: index }));

type SingUpFieldType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordAgain: string;
  sex: number | string;
};

const state: SingUpFieldType = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordAgain: '',
  sex: '',
};

const rules: RuleType<SingUpFieldType> = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  password: {
    required,
    matchPattern: matchPattern(constants.PASSWORD_PATTERN, 'Format password is wrong!'),
  },
  passwordAgain: {
    required,
    sameAs: sameAs('password'),
  },
  sex: {
    required,
  },
};

const formId: string = 'signup-form';

function Signup(): JSX.Element {
  const navigate = useNavigate();
  const { firstName, lastName, email, password, passwordAgain, sex, handleSubmit, validate } = useForm<
    SingUpFieldType,
    RuleType<SingUpFieldType>
  >(state, rules, formId);

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      const stateWithoutPasswordAgain: any = {...state};
      delete stateWithoutPasswordAgain.passwordAgain;

      signUp(stateWithoutPasswordAgain)
        .then((response) => {
          showToast('Sign up!', response.data.message);
          navigate(path.LOGIN);
        })
        .catch((error) => showToast('Sign up!', error.response.data.message));
    }
  }, []);

  return (
    <ClientLoginWrapper name="sign up">
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
          </GridItem>
          <GridItem lg={12}>
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
    </ClientLoginWrapper>
  );
}

export default Signup;
