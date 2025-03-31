import { JSX, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useNavigate, useLoaderData, useParams } from 'react-router-dom';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Switch from 'components/form/form-control/switch/switch';
import Button from 'components/button/button';
import useForm, { RuleType } from 'hooks/useForm';
import useModalNavigation from 'hooks/useModalNavigation';
import useSetTheLastNavigateName from 'hooks/useSetTheLastNavigateName';
import useComponentDidMount from 'hooks/useComponentDidMount';
import { required, email as emailValidate, ErrorFieldInfo } from 'hooks/useValidate';
import { addUser, loadUserDetail, updateUser, getAllUsers } from '../fetcher';
import { convertBase64ToSingleFile, showToast } from 'utils';
import BlockerProvider from 'contexts/blocker';
import { HaveLoadedFnType } from 'interfaces';
import paths from 'router/paths';
import './style.scss';

type UserType = {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  mfa: boolean;
};

const state: UserType = {
  firstName: '',
  lastName: '',
  email: '',
  avatar: '',
  mfa: true
};

const formId: string = 'user_form';

function UserDetail(): JSX.Element {
  const [emails, setEmails] = useState<string[]>([]);
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  const { id } = useParams();
  const user = loaderData?.data;

  const emailDuplicateValidate = useCallback(
    (message: string,) =>
      (currentValue: string): ErrorFieldInfo => {
        return {
          error: id ? false : emails.includes(currentValue),
          message
        };
      },
    [emails]
  );

  const rules: RuleType<UserType> = {
    email: {
      required,
      emailValidate: emailValidate('Email invalid!'),
      emailDuplicateValidate: emailDuplicateValidate('Email is duplicate!')
    },
    firstName: { required },
    lastName: { required },
    avatar: { required },
    mfa: {}
  };

  const { firstName, lastName, avatar, email, mfa, reset, handleSubmit, validate } = useForm<
    UserType,
    RuleType<UserType>
  >(state, rules, formId, [emails]);

  const UserForm = useCallback(({ children }: { children: JSX.Element }): JSX.Element => {
    useModalNavigation({ onLeaveAction: reset });
    return children;
  }, []);

  const backToUserList = useCallback(() => {
    navigate(`${paths.HOME}/${paths.USER}`);
  }, []);

  const handleUserSaved = useCallback((promise: Promise<AxiosResponse>, title: string): void => {
    promise.then((res) => {
      reset();
      showToast(title, res.data.message);
      setTimeout(() => backToUserList(), 100);
    })
    .catch((error) => showToast(title, error.response.data.message));
  }, []);

  const onSubmit = useCallback((formData: FormData) => {
    handleSubmit();

    if (!validate.error) {
      if (!formData.has('mfa')) {
        formData.append('mfa', 'false');
      }

      if (id) {
        formData.append('userId', id);
        handleUserSaved(updateUser(formData), 'Update user');
      } else {
        handleUserSaved(addUser(formData), 'Create user');
      }
    }
  }, []);

  const userName = useMemo<string>(() => {
    return user ? `${user.firstName} ${user.lastName}` : '';
  }, [user]);

  useSetTheLastNavigateName(userName);

  useLayoutEffect(() => {
    if (user) {
      firstName.watch(user.firstName);
      lastName.watch(user.lastName);
      email.watch(user.email);
      mfa.watch(user.mfaEnable);
      convertBase64ToSingleFile(user.avatar, `${user.firstName}-${user.lastName}`)
        .then((res) => {
          if (res.type.includes('image')) {
            avatar.watch(res);
          }
        });
    }
  }, []);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        getAllUsers()
          .then(res => setEmails(res.data.map(({ email }: { email: string }) => email)))
          .catch(() => setEmails([]));
      }
    };
  }, []);

  return (
    <BlockerProvider isNavigate={validate.dirty}>
      <UserForm>
        <section className="user-detail">
          <Button variant="outline" className="back-btn" onClick={backToUserList}>
            &#8592;Back
          </Button>
          <Form id={formId} onSubmit={onSubmit} className="user-form">
            <Grid
              lg={2}
              sm={1}
              style={{
                marginBottom: 15,
                gap: 17
              }}>
              <GridItem sm={12} md={6} lg={2}>
                <Input
                  {...firstName}
                  label="First name"
                  name="firstName"
                  inputColumnSize={{
                    lg: 8
                  }}
                  labelColumnSize={{
                    lg: 4
                  }} />
              </GridItem>
              <GridItem sm={12} md={6} lg={2}>
                <Input
                  {...lastName}
                  label="Last name"
                  name="lastName"
                  inputColumnSize={{
                    lg: 8
                  }}
                  labelColumnSize={{
                    lg: 4
                  }} />
              </GridItem>
              <GridItem sm={12} md={6} lg={3}>
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
              <GridItem sm={12} md={6} lg={2}>
                <FileDragDropUpload
                  multiple={false}
                  {...avatar}
                  label="Avatar"
                  name="avatar"
                  inputColumnSize={{
                    lg: 12
                  }}
                  labelColumnSize={{
                    lg: 12
                  }}  />
              </GridItem>
              <GridItem sm={12} md={6} lg={3}>
                <Switch
                  {...mfa}
                  label="Mfa"
                  name="mfa"
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
      </UserForm>
    </BlockerProvider>
  );
}

export { loadUserDetail };
export default UserDetail;
