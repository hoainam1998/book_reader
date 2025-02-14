import { JSX, useCallback, useEffect, useState } from 'react';
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
import { required, email as emailValidate, ErrorFieldInfo } from 'hooks/useValidate';
import { addUser, loadUserDetail, updateUser, getAllEmail } from '../fetcher';
import { convertBase64ToSingleFile, showToast } from 'utils';
import BlockerProvider from 'contexts/blocker';
import paths from 'paths';
import './style.scss';
import useComponentDidMount, { HaveLoadedFnType } from 'hooks/useComponentDidMount';

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
      emailValidate,
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

  const onSubmit = useCallback((formData: FormData) => {
    handleSubmit();

    if (!validate.error) {
      const saveUser = (): Promise<AxiosResponse> => {
        if (!formData.has('mfa')) {
          formData.append('mfa', 'false');
        }

        if (id) {
          formData.append('userId', id);
          return updateUser(formData);
        } else {
          return addUser(formData);
        }
      };

      saveUser()
        .then(() => {
          reset();
          setTimeout(() => backToUserList(), 100);
        })
        .catch((error) => showToast('User', error.response.data.message));
    }
  }, []);

  useEffect(() => {
    if (loaderData) {
      const user = loaderData.data;
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
        getAllEmail()
          .then(res => setEmails(res.data))
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
