import { JSX, useCallback } from 'react';
import Grid, { GridItem } from 'components/grid/grid';
import Input from 'components/form/form-control/input/input';
import Form from 'components/form/form';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import { OptionPrototype } from 'components/form/form-control/form-control';
import Radio from 'components/form/form-control/radio/radio';
import useForm, { RuleType } from 'hooks/useForm';
import { required, matchPattern, maxLength } from 'hooks/useValidate';
import './style.scss';

type AuthorStateType = {
  name: string;
  sex: number;
  avatar: File | string;
  yearOfBirth: number;
  yearOfDead: number;
};

const state: AuthorStateType = {
  name: '',
  sex: 0,
  avatar: '',
  yearOfBirth: 0,
  yearOfDead: 0
};

const rules: RuleType<AuthorStateType> = {
  name: { required, maxLength: maxLength(20) },
  sex: { required },
  avatar: { required },
  yearOfBirth: { required, matchPattern: matchPattern(/^([1-9]{4})$/) },
  yearOfDead: { required, matchPattern: matchPattern(/^([1-9]{4})$/) }
};

const formId: string = 'author-form';

const sexOptions: OptionPrototype<number>[] = [
  {
    label: 'Male',
    value: 0
  },
  {
    label: 'Female',
    value: 1
  }
];

function AuthorDetail(): JSX.Element  {
  const {
    name,
    sex,
    avatar,
    yearOfBirth,
    yearOfDead,
    handleSubmit,
    validate,
    reset
  } = useForm<AuthorStateType, RuleType<AuthorStateType>>(state, rules, formId);

  const onSubmit = useCallback((form: FormData) => {
    handleSubmit();

    if (!validate.error) {
      console.log(form);
    }
  }, [validate]);

  console.log(name);

  return (
    <Form id={formId} className="author-form" submitLabel="Save" onSubmit={onSubmit}>
      <Grid style={{ gap: 25 }}>
        <GridItem lg={3}>
          <Input {...name} name="name" label="Name" labelColumnSize={{
            lg: 2
          }} />
        </GridItem>
        <GridItem lg={2}>
          <Radio {...sex} label="Sex" name="sex" horizontal options={sexOptions} />
        </GridItem>
        <GridItem lg={2}>
          <Input {...yearOfBirth} label="Year of birth" name="yearOfBirth"
            labelColumnSize={{
              lg: 5
            }}
            inputColumnSize={{
              lg: 7
            }}/>
        </GridItem>
        <GridItem lg={2}>
          <Input {...yearOfDead} label="Year of dead" name="yearOfDead"
          labelColumnSize={{
            lg: 5
          }}
          inputColumnSize={{
            lg: 7
          }} />
        </GridItem>
        <GridItem lg={3}>
          <FileDragDropUpload {...avatar} name="avatar" label="Avatar" multiple={false}
            labelColumnSize={{
              lg: 12
            }}
            inputColumnSize={{
              lg: 12
            }} />
        </GridItem>
      </Grid>
    </Form>
  );
}

export default AuthorDetail;
