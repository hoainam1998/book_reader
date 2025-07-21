import { JSX, useCallback, useMemo, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Grid, { GridItem } from 'components/grid/grid';
import Form from 'components/form/form';
import Input from 'components/form/form-control/input/input';
import Switch from 'components/form/form-control/switch/switch';
import Button from 'components/button/button';
import Radio from 'components/form/form-control/radio/radio';
import { OptionPrototype } from 'components/form/form-control/form-control';
import useForm, { RuleType } from 'hooks/useForm';
import useModalNavigation from 'hooks/useModalNavigation';
import useSetTheLastNavigateName from 'hooks/useSetTheLastNavigateName';
import useComponentWillMount from 'hooks/useComponentWillMount';
import { required, email as emailValidate, ErrorFieldInfo, matchPattern } from 'hooks/useValidate';
import { addUser, updateUser, getAllUsers, getUserDetail } from '../fetcher';
import { showToast } from 'utils';
import BlockerProvider from 'contexts/blocker';
import { Role } from 'enums';
import auth from 'store/auth';
import { HaveLoadedFnType, UserType } from 'interfaces';
import paths from 'router/paths';
import constants from 'read-only-variables';
import './style.scss';

type AllUserType = Pick<UserType, 'email' | 'phone'>[];

const state: UserType = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  mfa: true,
  sex: 0,
  power: false,
};

const formId: string = 'user_form';
const sexOptions: OptionPrototype<number>[] = constants.SEX.map((label, index) => ({ label, value: index }));

function UserDetail(): JSX.Element {
  const [emails, setEmails] = useState<string[]>([]);
  const [phones, setPhones] = useState<string[]>([]);
  const [name, setName] = useState<string[]>([]);
  const [allowLeave, setAllowLeave] = useState<boolean>(false);
  const navigate = useNavigate();
  const { id } = useParams();

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

  const rules: RuleType<Omit<UserType, 'userId'>> = {
    email: {
      required,
      emailValidate: emailValidate('Email invalid!'),
      emailDuplicateValidate: emailDuplicateValidate('Email is duplicate!')
    },
    firstName: { required },
    lastName: { required },
    sex: {},
    phone: {
      required,
      phoneDuplicateValidate: phoneDuplicateValidate('Phone is duplicate!'),
      matchPattern: matchPattern(constants.PHONE_NUMBER_PATTERN, 'Format phone number is wrong!')
    },
    power: {},
    mfa: {}
  };

  const {
    firstName,
    lastName,
    email,
    phone,
    mfa,
    sex,
    power,
    reset,
    handleSubmit,
    validate
  } = useForm<
    UserType,
    RuleType<UserType>
  >(state, rules, formId, [emails, phones]);

  const UserForm = useCallback(({ children }: { children: JSX.Element }): JSX.Element => {
    useModalNavigation({ onLeaveAction: reset });
    return children;
  }, []);

  const backToUserList = useCallback((): void => {
    navigate(`${paths.HOME}/${paths.USER}`);
    reset();
  }, [reset]);

  const handleUserSaved = useCallback((promise: Promise<AxiosResponse>, title: string): void => {
    promise.then((res) => {
      showToast(title, res.data.message);
      setAllowLeave(true);
      setTimeout(backToUserList, 200);
    })
    .catch((error) => showToast(title, error.response.data.message));
  }, []);

  const onSubmit = useCallback((): void => {
    handleSubmit();

    if (!validate.error) {
      if (id) {
        handleUserSaved(updateUser({ ...state, userId: id }), 'Update user');
      } else {
        handleUserSaved(addUser(state), 'Create user');
      }
    }
  }, [state]);

  const userName = useMemo<string>(() => {
    return name.length ? name.join(' ') : '';
  }, [name]);

  useSetTheLastNavigateName(userName);

  useComponentWillMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        getAllUsers(id)
          .then((res: AxiosResponse<AllUserType>) => {
            const { emailsList, phonesList } =
              res.data.reduce<{ phonesList: string[], emailsList: string[]}>((flat, current) => {
                flat.phonesList.push(current.phone);
                flat.emailsList.push(current.email);
                return flat;
              }, { phonesList: [], emailsList: [] });
            setEmails(emailsList);
            setPhones(phonesList);
          })
          .catch(() => {
            setEmails([]);
            setPhones([]);
          });

          if (id) {
            getUserDetail(id)
              .then((response) => {
                const user = response.data;
                firstName.watch(user.firstName);
                lastName.watch(user.lastName);
                email.watch(user.email);
                mfa.watch(user.mfaEnable);
                sex.watch(user.sex);
                phone.watch(user.phone);
                power.watch(user.power);
                setName([user.firstName, user.lastName]);
              })
              .catch((error) => showToast('User detail!', error.response.data.message));
          }
      }
    };
  }, []);

  return (
    <BlockerProvider isNavigate={validate.dirty && !allowLeave}>
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
              <GridItem sm={12} md={6} lg={6}>
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
              <GridItem sm={12} md={6} lg={6}>
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
              <GridItem sm={12} md={6} lg={6}>
                <Input
                  {...email}
                  label="Email"
                  type="email"
                  name="email"
                  inputColumnSize={{
                    lg: 10,
                    md: 8,
                    sm: 8
                  }}
                  labelColumnSize={{
                    lg: 2,
                    sm: 4,
                    md: 4,
                  }} />
              </GridItem>
              <GridItem sm={12} md={6} lg={6}>
                <Input
                  {...phone}
                  label="Phone"
                  name="phone"
                  inputColumnSize={{
                    lg: 9,
                    sm: 8,
                    md: 8,
                  }}
                  labelColumnSize={{
                    lg: 3,
                    sm: 4,
                    md: 4
                  }} />
              </GridItem>
              <GridItem sm={12} md={4} lg={3}>
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
              {
                auth.Role === Role.SUPER_ADMIN
                  ? <GridItem sm={12} md={4} lg={3}>
                      <Switch
                        {...power}
                        label="Admin"
                        name="power"
                        checkValue={1}
                        notCheckValue={0}
                        inputColumnSize={{
                          lg: 8
                        }}
                        labelColumnSize={{
                          lg: 4
                        }} />
                    </GridItem>
                  : <></>
              }
              <GridItem sm={12} md={4} lg={3}>
                <Radio
                  {...sex}
                  label="Sex"
                  name="sex"
                  horizontal
                  options={sexOptions}
                  labelColumnSize={{
                    lg: 2
                  }}
                  inputColumnSize={{
                    lg: 10
                  }} />
              </GridItem>
            </Grid>
          </Form>
        </section>
      </UserForm>
    </BlockerProvider>
  );
}

export default UserDetail;
