import { JSX } from 'react';
import Grid, { GridItem } from 'components/grid/grid';
import Calendar from 'components/calendar/calendar';
import Input from 'components/form/form-control/input/input';
import Select from 'components/form/form-control/select/select';
import Form from 'components/form/form';
import useForm, { RuleType, StateType } from 'hooks/useForm';
import { required } from 'hooks/useValidate';
import './style.scss';

type RuleTypeBook = RuleType & ArrayLike<RuleType>;

const state: StateType = {
  name: '',
  pdf: null,
  publishedDay: null,
  publishedTime: null,
  categoryId: null
};

const rules: RuleType = {
  name: { required },
  pdf: { required },
  publishedDay: { required },
  publishedTime: { required },
  categoryId: { required }
};

const formId: string = 'book-detail-form';

function BookDetail(): JSX.Element {
  const {
    name,
    categoryId,
    publishedTime,
    publishedDay,
    pdf,
    handleSubmit,
    validate,
    reset
  } = useForm(state, rules as RuleTypeBook, formId);

  const onSubmit = (): void => {
    handleSubmit();
  };

  return (
    <Form id={formId} submitLabel="Save" onSubmit={onSubmit}>
      <Grid>
        <GridItem lg={3}>
          <Input
            {...name}
            label="Name"
            name="name"
            labelClass="name-label"
            inputClass="name-input" />
        </GridItem>
        <GridItem lg={3}>
          <Input
            {...pdf}
            type="file"
            accept=".pdf"
            label="Pdf file"
            name="pdf"
            labelClass="pdf-label"
            inputClass="pdf-input" />
        </GridItem>
        <GridItem lg={2}>
          <Input
            {...publishedTime}
            type="number"
            label="Published time"
            labelClass="published-time-label"
            inputClass="published-time-input"
            ame="publishedTime" />
        </GridItem>
        <GridItem lg={2}>
          <Calendar
            {...publishedDay}
            labelClass="label"
            inputClass="input"
            label="Publish day"
            name="publish-day" />
        </GridItem>
        <GridItem lg={2}>
          <Select
            {...categoryId}
            label="Category"
            labelClass="category-id-label"
            selectClass="category-id-input"
            name="categoryId"
            options={[]} />
        </GridItem>
      </Grid>
    </Form>
  );
}

export default BookDetail;
