import { JSX, useCallback, useRef, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import Grid, { GridItem } from 'components/grid/grid';
import Calendar from 'components/calendar/calendar';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import Select, { OptionPrototype } from 'components/form/form-control/select/select';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Form from 'components/form/form';
import './style.scss';
import { FieldValidateProps } from 'hooks/useForm';
import useModalNavigation from '../useModalNavigation';

type BookInformationPropsType = {
  name: FieldValidateProps;
  pdf: FieldValidateProps;
  publishedTime: FieldValidateProps;
  publishedDay: FieldValidateProps;
  categoryId: FieldValidateProps;
  images: FieldValidateProps;
  onReset: () => void;
  onSubmit: (formData: FormData) => void
};

type CategoryOptionsType = {
  name: string;
  category_id: string;
} & OptionPrototype<string>;

const formId: string = 'book-detail-form';

function BookInformation({
  name,
  pdf,
  publishedTime,
  publishedDay,
  categoryId,
  images,
  onReset,
  onSubmit
}: BookInformationPropsType): JSX.Element {
  const loaderData: AxiosResponse = useLoaderData() as AxiosResponse;
  const categories: CategoryOptionsType[] = loaderData?.data.category.all || [];
  const pdfRef = useRef<InputRefType>(null);
  useModalNavigation({ onLeaveAction: onReset });

  const bookInformationFormSubmit = useCallback((): void => {
    const formData: FormData | null = new FormData(document.forms.namedItem(formId)!);
    formData.set('publishedDay', publishedDay.value);
    formData && onSubmit(formData);
  }, [publishedDay.value]);

  useEffect(() => {
    if (pdf.value instanceof File && pdfRef.current?.input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(pdf.value);
      pdfRef.current.input.files = dataTransfer.files;
    }
  }, [pdf.value]);

  return (
    <Form id={formId}
    submitLabel="Save"
    onSubmit={bookInformationFormSubmit}
    className="book-information">
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
            inputClass="pdf-input"
            ref={pdfRef} />
        </GridItem>
        <GridItem lg={2}>
          <Input
            {...publishedTime}
            type="number"
            label="Published time"
            labelClass="published-time-label"
            inputClass="published-time-input"
            name="publishedTime" />
        </GridItem>
        <GridItem lg={2}>
          <Calendar
            {...publishedDay}
            labelClass="label"
            inputClass="input"
            label="Publish day"
            name="publishedDay" />
        </GridItem>
        <GridItem lg={2}>
          <Select<string, CategoryOptionsType>
            {...categoryId}
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
          <FileDragDropUpload
            {...images}
            name="images"
            label="Images"
            className="image-select-box" />
        </GridItem>
      </Grid>
    </Form>
  );
}

export default BookInformation;
