import { JSX, useCallback, useEffect } from 'react';
import { useNavigate, useLoaderData, useParams } from 'react-router-dom';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Switch from 'components/form/form-control/switch/switch';
import Button from 'components/button/button';
import useForm, { RuleType } from 'hooks/useForm';
import useModalNavigation from 'hooks/useModalNavigation';
import { required, email } from 'hooks/useValidate';
import { addUser, loadUserDetail, updateUser } from '../fetcher';
import { convertBase64ToSingleFile } from 'utils';
import BlockerProvider from 'contexts/blocker';
import paths from 'paths';
import './style.scss';
import { AxiosResponse } from 'axios';

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

const rules: RuleType<UserType> = {
  email: { required, email },
  firstName: { required },
  lastName: { required },
  avatar: { required },
  mfa: {}
};

const formId: string = 'user_form';

function UserDetail(): JSX.Element {
  const { firstName, lastName, avatar, email, mfa, reset, handleSubmit, validate } = useForm<
    UserType,
    RuleType<UserType>
  >(state, rules, formId);
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  const { id } = useParams();

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
        if (id) {
          formData.append('userId', id);
          return updateUser(formData);
        } else {
          return addUser(formData);
        }
      };
      saveUser().then(() => {
        reset();
        setTimeout(() => {
          backToUserList();
        }, 100);
      });
    }
  }, []);

  useEffect(() => {
    if (loaderData) {
      const user = loaderData.data.user.detail;
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
                  name="first_name"
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
                  name="last_name"
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
