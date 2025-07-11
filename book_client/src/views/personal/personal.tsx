import { JSX, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import BlockerProvider from 'contexts/blocker';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Button from 'components/button/button';
import Radio from 'components/form/form-control/radio/radio';
import { OptionPrototype } from 'components/form/form-control/form-control';
import { required, email as emailValidate, matchPattern, ErrorFieldInfo } from 'hooks/useValidate';
import useForm, { RuleType } from 'hooks/useForm';
import useModalNavigation from 'hooks/useModalNavigation';
import store from 'store/auth';
import path from 'router/paths';
import { clsx, convertBase64ToSingleFile, showToast } from 'utils';
import constants from 'read-only-variables';
import { PersonalType } from 'interfaces';
import './style.scss';

type PersonalStateType = Omit<PersonalType, 'id'>;

const state: PersonalStateType = {
  firstName: '',
  lastName: '',
  email: '',
  avatar: '',
  phone: '',
  sex: 0,
};

const formId: string = 'personal-form';
const sexOptions: OptionPrototype<number>[] = constants.SEX.map((label, index) => ({ label, value: index }));

type PersonalPropsType = {
  personal: PersonalType | null;
  update: (formData: FormData) => Promise<AxiosResponse>;
  getAllUsers: (userId: string) => Promise<AxiosResponse>;
  logout: () => Promise<AxiosResponse>;
};

function Personal({ personal, update, getAllUsers, logout }: PersonalPropsType): JSX.Element {
  const [emails, setEmails] = useState<string[]>([]);
  const [phones, setPhones] = useState<string[]>([]);
  const [reLogin, setReLogin] = useState<boolean>(false);
  const navigate = useNavigate();

  const emailDuplicateValidate = useCallback(
    (message: string) =>
      (currentValue: string): ErrorFieldInfo => {
        return {
          error: emails.includes(currentValue),
          message
        };
      },
    [emails]
  );

  const phoneDuplicateValidate = useCallback(
    (message: string) =>
      (currentValue: string): ErrorFieldInfo => {
        return {
          error: phones.includes(currentValue),
          message
        };
      },
    [phones]
  );

  const rules: RuleType<Omit<PersonalStateType, 'userId'>> = {
    email: {
      required,
      emailValidate: emailValidate('Email invalid!'),
      emailDuplicateValidate: emailDuplicateValidate('Email is duplicate!')
    },
    firstName: { required },
    lastName: { required },
    avatar: { required },
    sex: { required },
    phone: {
      required,
      phoneDuplicateValidate: phoneDuplicateValidate('Phone is duplicate!'),
      matchPattern: matchPattern(constants.PHONE_NUMBER_PATTERN, 'Format phone number is wrong!')
    },
  };

  const {
    firstName,
    lastName,
    avatar,
    email,
    phone,
    sex,
    handleSubmit,
    validate,
    reset
  } = useForm<
    PersonalStateType,
    RuleType<PersonalStateType>
  >(state, rules, formId, [emails, phones]);

  const backToPrevious = useCallback((event: any): void => {
    event.preventDefault();
    navigate(path.HOME);
  }, []);

  const PersonalForm = useCallback(({ children }: { children: JSX.Element }): JSX.Element => {
    useModalNavigation({ onLeaveAction: reset });
    return children;
  }, []);

  const onSubmit = useCallback((formData: FormData): void => {
    handleSubmit();
    if (!validate.error) {
      update(formData)
        .then((res) => {
          showToast('Update your information!', res.data.message);
          setReLogin(true);
          logout()
            .then(() => {
              store.logout();
              setTimeout(() => navigate(path.LOGIN), 200);
            });
        })
        .catch((err) => showToast('Update your information!', err.response.data.message));
    }
  }, []);

  useEffect(() => {
    if (personal) {
      const personalName = `${personal.firstName} ${personal.lastName}`;
      firstName.watch(personal.firstName);
      lastName.watch(personal.lastName);
      email.watch(personal.email);
      phone.watch(personal.phone);
      sex.watch(personal.sex);
      convertBase64ToSingleFile(personal.avatar, personalName)
        .then(res => {
          if (res.type.includes('image')) {
            avatar.watch(res);
          }
        });
      getAllUsers(personal.id)
        .then((res: AxiosResponse<PersonalType[]>) => {
          const { emailsList, phonesList } =
            res.data.reduce<{ phonesList: string[], emailsList: string[]}>((flat, current) => {
              flat.phonesList.push(current.phone);
              flat.emailsList.push(current.email);
              return flat;
            }, { phonesList: [], emailsList: [] });

            setEmails(emailsList);
            setPhones(phonesList);
          })
          .catch(() => setEmails([]));
    }
  }, [personal]);

  return (
    <BlockerProvider isNavigate={validate.dirty && !reLogin}>
      <PersonalForm>
        <section className={clsx({
          'client-personal': globalThis.isClient,
          'admin-personal flex-center': !globalThis.isClient,
          })}>
          <Form id={formId} onSubmit={onSubmit} className="user-form hight-light form-size">
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
              <GridItem sm={12} md={12} lg={6}>
                <Input
                  {...firstName}
                  label="First name"
                  name="firstName"
                  inputColumnSize={{
                    lg: 8
                  }}
                  labelColumnSize={{
                    lg: 4
                  }}/>
              </GridItem>
              <GridItem sm={12} md={12} lg={6}>
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
              <GridItem sm={12} md={12} lg={6}>
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
              <GridItem sm={12} md={12} lg={6}
                style={{
                  lg: {
                    gridRow: 'span 4'
                  }
                }}>
                <FileDragDropUpload
                  {...avatar}
                  multiple={false}
                  label="Avatar"
                  name="avatar"
                  inputColumnSize={{
                    lg: 12
                  }}
                  labelColumnSize={{
                    lg: 12
                  }} />
              </GridItem>
              <GridItem sm={12} md={12} lg={6}>
                <Input
                  {...phone}
                  label="Phone number"
                  name="phone"
                  inputColumnSize={{
                    lg: 8
                  }}
                  labelColumnSize={{
                    lg: 4
                  }} />
              </GridItem>
              <GridItem sm={12} md={12} lg={6}>
                <Radio
                  {...sex}
                  label="Sex"
                  name="sex"
                  className="align-items-center"
                  horizontal
                  options={sexOptions}
                  labelColumnSize={{
                    lg: 4
                  }}
                  inputColumnSize={{
                    lg: 8
                  }} />
              </GridItem>
            </Grid>
          </Form>
        </section>
      </PersonalForm>
    </BlockerProvider>
  );
}

export default Personal;
