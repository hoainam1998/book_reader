import { JSX, useCallback } from 'react';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import ClientLoginWrapper from 'views/login-group/login-wrapper/client-login-wrapper/client-login-wrapper';
import { email, matchPattern, required } from 'hooks/useValidate';
import useForm, { RuleType } from 'hooks/useForm';
import constants from 'read-only-variables';

type SingUpFieldType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const state: SingUpFieldType = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

const rules: RuleType<SingUpFieldType> = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  password: {
    required,
    matchPattern: matchPattern(constants.PASSWORD_PATTERN, 'Format password is wrong!')
  },
};

const formId: string = 'signup-form';

function Signup(): JSX.Element {
  const { firstName, lastName, email, password, handleSubmit, validate } = useForm<
    SingUpFieldType,
    RuleType<SingUpFieldType>
  >(state, rules, formId);

  const onSubmit = useCallback((): void => {
    handleSubmit();
    if (!validate.error) {
      // onLogin(email.value, password.value, reset);
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
        </Grid>
      </Form>
    </ClientLoginWrapper>
  );
}

export default Signup;
