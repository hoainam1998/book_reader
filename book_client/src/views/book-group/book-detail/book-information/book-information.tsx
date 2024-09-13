import { JSX, useCallback, useRef, useEffect, useSyncExternalStore } from 'react';
import { useLoaderData } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import Grid, { GridItem } from 'components/grid/grid';
import Calendar from 'components/calendar/calendar';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import Select, { OptionPrototype } from 'components/form/form-control/select/select';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Form from 'components/form/form';
import useForm, { RuleType } from 'hooks/useForm';
import { required, maxLength } from 'hooks/useValidate';
import useModalNavigation from '../useModalNavigation';
import store, { CurrentStoreType, Image } from '../storage';
import {
  getBookDetail,
  saveBookInformation
} from '../fetcher';
import './style.scss';
import useComponentDidMount, { HaveLoadedFnType } from 'hooks/useComponentDidMount';
const { subscribe, getSnapshot, updateBookInfo, updateConditionNavigate } = store;

type CategoryOptionsType = {
  name: string;
  category_id: string;
} & OptionPrototype<string>;

type BookStateType = {
  name: string;
  pdf: File | null;
  publishedDay: number | null;
  publishedTime: number | null;
  categoryId: string;
  images: File[] | null;
};

const formId: string = 'book-detail-form';

const rules: RuleType<BookStateType> = {
  name: { required, maxLength: maxLength(3) },
  pdf: { required },
  publishedDay: { required },
  publishedTime: { required },
  categoryId: { required },
  images: { required, maxLength: maxLength(8) }
};

const state: BookStateType = {
  name: '',
  pdf: null,
  publishedDay: null,
  publishedTime: null,
  categoryId: '',
  images: null
};

/**
 * Convert base64 image string list to promise all file list. List file return by this function will be re-assign to input type file.
 *
 * @param {Image[]} base64String - base64 string chain.
 * @returns {Promise<File[]>} - promise all file list.
 */
const convertBase64ImageToFile = (base64String: Image[]): Promise<File[]> => {
  const imagesPromise: Promise<File>[] = base64String.map(({ image, name }) => {
    return new Promise((resolve, reject) => {
      fetch(image)
        .then((res) => res.blob())
        .then((blob) => resolve(new File([blob], name, { type: blob.type })))
        .catch((err) => reject(err));
    });
  });
  return Promise.all(imagesPromise);
};

/**
 * Convert url to promise file. File return by this function will be re-assign to input type file.
 *
 * @param {string} filePath - url link to file.
 * @returns {Promise<File>} - promise include file.
 */
const convertFilePathToFile = (filePath: string, name: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    fetch(filePath)
      .then((res) => res.blob())
      .then((blob) => {
        const fileName: string = `${name}${blob.type.match(/(?=\/)(.\w+)/g)![0].replace('/', '.')}`;
        resolve(new File([blob], fileName));
      })
      .catch((err) => reject(err));
  });
};

function BookInformation(): JSX.Element {
  const {
    name,
    categoryId,
    publishedTime,
    publishedDay,
    pdf,
    images,
    handleSubmit,
    validate,
    reset
  } = useForm(state, rules, formId);
  const { data, step }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);
  const loaderData: AxiosResponse = useLoaderData() as AxiosResponse;
  const categories: CategoryOptionsType[] = loaderData?.data.category.all || [];
  const pdfRef = useRef<InputRefType>(null);
  useModalNavigation({ onLeaveAction: reset });

  const onSubmit = useCallback(
    (formData: FormData): void => {
      handleSubmit();

      if (!validate.error) {
        if (data?.bookId) {
          formData.append('bookId', data.bookId);
        }
        saveBookInformation(formData).then((res) => {
          const bookId: string = res.data.bookId;
          getBookDetail(bookId).then((res) =>
            updateBookInfo({ data: { ...res.data.book.detail, bookId }, step: 2, disableStep: 3 })
          );
        });
      }
    },
    [validate.error]
  );

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

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (data && step === 1) {
        name.watch(data.name);
        publishedTime.watch(data.publishedTime);
        publishedDay.watch(+data.publishedDay);
        categoryId.watch(data.categoryId);
        pdf.watch('');
        images.watch('');
        if (!haveFetched()) {
          convertFilePathToFile(`${process.env.BASE_URL}/${data.pdf}`, data.name)
            .then((res) =>pdf.watch(res));
        }
        convertBase64ImageToFile(data.images)
          .then((res) => images.watch(res));
      }
      return () => reset();
    };
  }, []);

  useEffect(() => {
    updateConditionNavigate(validate.dirty);
  }, [validate.dirty]);

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
            min="1"
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
