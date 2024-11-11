import { JSX, useCallback, useSyncExternalStore, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlockerProvider from 'contexts/blocker';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Button from 'components/button/button';
import { required, email, matchPattern } from 'hooks/useValidate';
import useForm, { RuleType } from 'hooks/useForm';
import store, { UserLogin } from 'store/auth';
import { updatePerson } from './fetcher';
import { convertBase64ToSingleFile } from 'utils';
import constants from 'read-only-variables';
import './style.scss';
const { subscribe, getSnapshot } = store;

type PersonalType = {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  password: string;
};

const state: PersonalType = {
  firstName: '',
  lastName: '',
  email: '',
  avatar: '',
  password: ''
};

const rules: RuleType<PersonalType> = {
  email: { required, email },
  firstName: { required },
  lastName: { required },
  avatar: { required },
  password: {
    required,
    matchPattern: matchPattern(constants.PASSWORD_PATTERN, 'Format password is wrong!')
  }
};

const formId: string = 'personal-form';

function Personal(): JSX.Element {
  const userLogin: UserLogin | null = useSyncExternalStore(subscribe, getSnapshot);
  const navigate = useNavigate();
  const { firstName, lastName, avatar, email, password, handleSubmit, validate } = useForm<
    PersonalType,
    RuleType<PersonalType>
  >(state, rules, formId);

  const backToPrevious = useCallback((event: any) => {
    event.preventDefault();
    navigate(-1);
  }, []);

  const onSubmit = useCallback((formData: FormData): void => {
    handleSubmit();
    if (!validate.error) {
      updatePerson(formData);
    }
  }, []);

  useEffect(() => {
    if (userLogin) {
      const nameSeparate: string[] = userLogin.name.split(' ');
      firstName.watch(nameSeparate[1]);
      lastName.watch(nameSeparate[0]);
      email.watch(userLogin.email);
      password.watch(userLogin.password);
      convertBase64ToSingleFile(userLogin.avatar, userLogin.name)
        .then(res => {
          if (res.type.includes('image')) {
            avatar.watch(res);
          }
        });
    }
  }, []);

  return (
    <BlockerProvider isNavigate={validate.dirty}>
      <section className="personal">
        <Form id={formId} onSubmit={onSubmit} className="user-form">
          <Grid
            lg={2}
            sm={1}
            style={{
              marginBottom: 15,
              gap: 17
            }}>
            <GridItem lg={12}>
              <Button variant="outline" onClick={backToPrevious}>
                &#8592;Back
              </Button>
            </GridItem>
            <GridItem sm={12} lg={6}>
              <Input
                {...firstName}
                label="First name"
                name="first_name"
                inputColumnSize={{
                  lg: 8
                }}
                labelColumnSize={{
                  lg: 4
                }}/>
            </GridItem>
            <GridItem sm={12} lg={6}>
              <Input
                {...lastName}
                label="Last name"
                name="last_name"
                inputColumnSize={{
                  lg: 8
                }}
                labelColumnSize={{
                  lg: 4
                }} />
            </GridItem>
            <GridItem sm={12} lg={6}>
              <Input
                {...email}
                label="Email"
                type="email"
                name="email"
                inputColumnSize={{
                  lg: 8
                }}
                labelColumnSize={{
                  lg: 4
                }} />
            </GridItem>
            <GridItem sm={12} lg={6}>
              <FileDragDropUpload
                {...avatar}
                multiple={false}
                label="Avatar"
                name="avatar"
                inputColumnSize={{
                  lg: 8
                }}
                labelColumnSize={{
                  lg: 8
                }} />
            </GridItem>
            <GridItem sm={12} lg={6}>
              <Input
                {...password}
                label="Password"
                type="password"
                name="password"
                inputColumnSize={{
                  lg: 8
                }}
                labelColumnSize={{
                  lg: 4
                }} />
            </GridItem>
          </Grid>
        </Form>
      </section>
    </BlockerProvider>
  );
}

export default Personal;
