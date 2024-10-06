import { JSX, useCallback, useEffect } from 'react';
import { useNavigate, useLoaderData, useParams } from 'react-router-dom';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Switch from 'components/form/form-control/switch/switch';
import Button from 'components/button/button';
import useForm, { RuleType } from 'hooks/useForm';
import { required, email } from 'hooks/useValidate';
import { addUser, loadUserDetail, updateUser } from '../fetcher';
import { convertBase64ToSingleFile } from 'utils';
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

const rules: RuleType<UserType> = {
  email: { required, email },
  firstName: { required },
  lastName: { required },
  avatar: { required },
  mfa: {}
};

const formId: string = 'user_form';

function UserDetail(): JSX.Element {
  const {
    firstName,
    lastName,
    avatar,
    email,
    mfa,
    handleSubmit,
    validate,
  } = useForm<UserType, RuleType<UserType>>(state, rules, formId);
  const loaderData = useLoaderData() as any;
  const navigate = useNavigate();
  const { id } = useParams();

  const onSubmit= useCallback((formData: FormData) => {
    handleSubmit();
    if (!validate.error) {
      if (id) {
        formData.append('userId', id);
        updateUser(formData)
          .then(() => navigate('/home/user'));
      } else {
        addUser(formData)
          .then(() => navigate('/home/user'));
      }
    }
  }, []);

  useEffect(() => {
    if (loaderData) {
      const user = loaderData.data.user.detail;
      firstName.watch(user.firstName);
      lastName.watch(user.lastName);
      email.watch(user.email);
      mfa.watch(user.mfaEnable);
      convertBase64ToSingleFile(user.avatar, `${user.firstName}-${user.lastName}.png`)
        .then(res => {
          if (res.type.includes('image')) {
            avatar.watch(res);
          }
        });
    }
  }, []);

  return (
    <section className="user-detail">
      <Button variant="outline" onClick={() => navigate('/home/user')}>&#8592;Back</Button>
      <Form id={formId} onSubmit={onSubmit} className="user-form">
        <Grid lg={2} style={{
          marginBottom: 15,
          gap: 17
        }}>
          <GridItem>
            <Input {...firstName} label="First name" name="first_name" />
          </GridItem>
          <GridItem>
            <Input {...lastName} label="Last name" name="last_name" />
          </GridItem>
          <GridItem>
            <Input {...email} label="Email" type="email" name="email" />
          </GridItem>
          <GridItem>
            <FileDragDropUpload multiple={false} {...avatar} label="Avatar" name="avatar" />
          </GridItem>
          <GridItem>
            <Switch {...mfa} label="Mfa" name="mfa" />
          </GridItem>
        </Grid>
      </Form>
    </section>
  );
}

export { loadUserDetail };
export default UserDetail;
