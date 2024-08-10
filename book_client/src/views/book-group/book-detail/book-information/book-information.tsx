import { JSX } from 'react';
import { InputProps } from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import Calendar, { CalendarPropsType } from 'components/calendar/calendar';
import Input from 'components/form/form-control/input/input';
import Select, { SelectPropsType } from 'components/form/form-control/select/select';
import Form from 'components/form/form';
import './style.scss';

type BookInformation = {
  [key: string]: InputProps | CalendarPropsType | SelectPropsType<unknown>;
} & {
  onSubmit: () => void
};

const formId: string = 'book-detail-form';

function BookInformation({ name, pdf, publishedTime, publishedDay, categoryId, onSubmit }: BookInformation): JSX.Element {
  return (
    <Form id={formId} submitLabel="Save" onSubmit={onSubmit}>
      <Grid>
        <GridItem lg={3}>
          <Input
            {...name as InputProps}
            label="Name"
            name="name"
            labelClass="name-label"
            inputClass="name-input" />
        </GridItem>
        <GridItem lg={3}>
          <Input
            {...pdf as InputProps}
            type="file"
            accept=".pdf"
            label="Pdf file"
            name="pdf"
            labelClass="pdf-label"
            inputClass="pdf-input" />
        </GridItem>
        <GridItem lg={2}>
          <Input
            {...publishedTime as InputProps}
            type="number"
            label="Published time"
            labelClass="published-time-label"
            inputClass="published-time-input"
            name="publishedTime" />
        </GridItem>
        <GridItem lg={2}>
          <Calendar
            {...publishedDay as CalendarPropsType}
            labelClass="label"
            inputClass="input"
            label="Publish day"
            name="publish-day" />
        </GridItem>
        <GridItem lg={2}>
          <Select<number>
            {...categoryId as SelectPropsType<number>}
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

export default BookInformation;
