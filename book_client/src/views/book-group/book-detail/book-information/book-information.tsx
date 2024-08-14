import { JSX } from 'react';
import { useLoaderData } from 'react-router-dom';
import { InputProps } from 'components/form/form-control/input/input';
import Grid, { GridItem } from 'components/grid/grid';
import Calendar, { CalendarPropsType } from 'components/calendar/calendar';
import Input from 'components/form/form-control/input/input';
import Select, { SelectPropsType, OptionPrototype } from 'components/form/form-control/select/select';
import FileDragDropUpload, { FileDragDropUploadType } from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Form from 'components/form/form';
import './style.scss';
import { AxiosResponse } from 'axios';

type BookInformation = {
  [key: string]:
    InputProps
    | CalendarPropsType
    | SelectPropsType<string, CategoryOptions>
    | FileDragDropUploadType
    | unknown;
} & {
  onSubmit: (formData: FormData) => void
};

type CategoryOptions = {
  name: string;
  category_id: string;
} & OptionPrototype<string>;

const formId: string = 'book-detail-form';

function BookInformation({ name, pdf, publishedTime, publishedDay, categoryId, images, onSubmit }: BookInformation): JSX.Element {
  const loaderData: AxiosResponse = useLoaderData() as AxiosResponse;
  const categories: CategoryOptions[] = loaderData?.data.category.all || [];

  const bookInformationFormSubmit = (): void => {
    const formData: FormData | null = new FormData(document.forms.namedItem(formId)!);
    const files: File[] | undefined = (images as FileDragDropUploadType).value;
    const fieldName: string = (images as FileDragDropUploadType).constructor.name;

    if (files && files.length) {
      files.forEach(file => {
        formData.append(fieldName, file);
      });
    }
    formData && onSubmit(formData);
  };

  return (
    <Form id={formId} submitLabel="Save" onSubmit={bookInformationFormSubmit} className="book-information">
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
          <Select<string, CategoryOptions>
            {...categoryId as SelectPropsType<string, CategoryOptions>}
            label="Category"
            labelClass="category-id-label"
            selectClass="category-id-input"
            placeholder="Please select category!"
            labelField="name"
            valueField="category_id"
            name="categoryId"
            options={categories} />
        </GridItem>
        <GridItem lg={12}>
          <FileDragDropUpload {...images as FileDragDropUploadType} label="Images" className="image-select-box" />
        </GridItem>
      </Grid>
    </Form>
  );
}

export default BookInformation;
