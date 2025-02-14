import {
  JSX,
  useCallback,
  useRef,
  useEffect,
  useSyncExternalStore,
  useState
} from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import Grid, { GridItem } from 'components/grid/grid';
import Calendar from 'components/calendar/calendar';
import Input, { InputRefType } from 'components/form/form-control/input/input';
import { OptionPrototype } from 'components/form/form-control/form-control';
import Select from 'components/form/form-control/select/select';
import FileDragDropUpload from 'components/file-drag-drop-upload/file-drag-drop-upload';
import Form from 'components/form/form';
import useForm, { RuleType } from 'hooks/useForm';
import { required, maxLength, ErrorFieldInfo } from 'hooks/useValidate';
import useModalNavigation from 'hooks/useModalNavigation';
import store, { CurrentStoreType, Image } from 'store/book';
import { getBookDetail, saveBookInformation, getAllBookName, updateBookInformation } from '../fetcher';
import useComponentDidMount, { HaveLoadedFnType } from 'hooks/useComponentDidMount';
import { convertBase64ToSingleFile, getExtnameFromBlobType, showToast } from 'utils';
import './style.scss';

const { subscribe, getSnapshot, updateBookInfo, updateConditionNavigate, deleteAllStorage } = store;

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
  avatar: File | null;
  images: File[] | null;
};

const formId: string = 'book-detail-form';

const state: BookStateType = {
  name: '',
  pdf: null,
  publishedDay: null,
  publishedTime: null,
  categoryId: '',
  avatar: null,
  images: null
};

/**
 * Convert base64 image string list to promise all file list.
 * List file return by this function will be re-assign to input type file.
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
  return fetch(filePath)
    .then((res) => res.blob())
    .then((blob) => {
      const extName: string = getExtnameFromBlobType(blob.type);
      const fileName: string = `${name}${extName}`;
      return new File([blob], fileName);
  });
};

function BookInformation(): JSX.Element {
  const [bookNames, setBookNames] = useState<string[]>([]);
  const { id } = useParams();
  const { data, step, disableStep }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);

  const validateName = useCallback(
    (message: string) =>
      (currentValue: string): ErrorFieldInfo => ({
        error: id ? false : bookNames.includes(currentValue),
        message
      }),
    [bookNames]
  );

  const rules: RuleType<BookStateType> = {
    name: {
      required,
      maxLength: maxLength(3),
      validateName: validateName('validate name')
    },
    pdf: { required },
    publishedDay: { required },
    publishedTime: { required },
    categoryId: { required },
    avatar: { required },
    images: { required, maxLength: maxLength(8) }
  };

  const {
    name,
    categoryId,
    publishedTime,
    publishedDay,
    pdf,
    images,
    avatar,
    handleSubmit,
    validate,
    reset
  } = useForm(state, rules, formId, [bookNames]);

  const loaderData: AxiosResponse = useLoaderData() as AxiosResponse;
  const categories: CategoryOptionsType[] = loaderData?.data || [];
  const pdfRef = useRef<InputRefType>(null);

  const onLeave = useCallback(() => {
    reset();
    deleteAllStorage();
  }, []);

  const onSubmit = useCallback(
    (formData: FormData): void => {
      handleSubmit();
      let promiseResult: Promise<AxiosResponse>;

      if (!validate.error) {
        if (data?.bookId) {
          formData.append('bookId', data.bookId);
          promiseResult = updateBookInformation(formData);
        } else {
          promiseResult = saveBookInformation(formData);
        }
        promiseResult.then((res) => {
          const bookId: string = data.bookId || res.data.bookId;
          getBookDetail(bookId, !!data.bookId).then((res) =>
            updateBookInfo({
              data: { ...res.data, bookId },
              step: 2,
              disableStep: disableStep === false ? false : 3
            })
          );
        }).catch((err) => showToast('Save book information', err.response.data.message));
      }
    },
    [validate.error]
  );

  const bookInformationFormSubmit = useCallback((): void => {
    const formData: FormData | null = new FormData(document.forms.namedItem(formId)!);
    formData.set('publishedDay', publishedDay.value);
    formData && onSubmit(formData);
  }, [publishedDay.value]);

  useModalNavigation({ onLeaveAction: onLeave });

  useEffect(() => {
    if (pdf.value instanceof File && pdfRef.current?.input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(pdf.value);
      pdfRef.current.input.files = dataTransfer.files;
    }
  }, [pdf.value]);

  useEffect(() => {
    updateConditionNavigate(validate.dirty);
  }, [validate.dirty]);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (data && step === 1 && id) {
        name.watch(data.name);
        publishedTime.watch(data.publishedTime);
        publishedDay.watch(+data.publishedDay);
        categoryId.watch(data.categoryId);
        pdf.watch('');
        images.watch('');
        if (!haveFetched()) {
          convertFilePathToFile(`${process.env.BASE_URL}/${data.pdf}`, data.name)
            .then((res) => pdf.watch(res));
        }
        convertBase64ImageToFile(data.images)
          .then((res) => images.watch(res));
        convertBase64ToSingleFile(data.avatar, data.name)
          .then((res) => {
            if (res.type.includes('image')) {
              avatar.watch([res]);
            }
          })
          .catch(() => console.warn('Load image failed!'));
      }
      return reset;
    };
  }, []);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        getAllBookName().then((res) => setBookNames(res.data));
      }
    };
  }, []);

  return (
    <Form
      id={formId}
      submitLabel="Save"
      onSubmit={bookInformationFormSubmit}
      className="book-information">
      <Grid>
        <GridItem sm={12} md={4} lg={3}>
          <Input
            {...name}
            label="Name"
            name="name"
            labelColumnSize= {{
              lg: 3,
              md: 12
            }}
            inputColumnSize={{
              lg: 9,
              md: 12
            }}/>
        </GridItem>
        <GridItem sm={12} md={5} lg={3}>
          <Input
            {...pdf}
            type="file"
            accept=".pdf"
            label="Pdf file"
            name="pdf"
            ref={pdfRef}
            labelColumnSize= {{
              lg: 3,
              md: 12
            }}
            inputColumnSize={{
              lg: 9,
              md: 12
            }}
          />
        </GridItem>
        <GridItem sm={12} md={3} lg={2}>
          <Input
            {...publishedTime}
            type="number"
            min="1"
            label="Published time"
            name="publishedTime"
            labelColumnSize= {{
              lg: 5,
              md: 12
            }}
            inputColumnSize={{
              lg: 7,
              md: 12
            }}
          />
        </GridItem>
        <GridItem sm={12} md={4} lg={2}>
          <Calendar
            {...publishedDay}
            labelClass="label"
            inputClass="input"
            label="Publish day"
            name="publishedDay"
            labelColumnSize= {{
              lg: 4,
              md: 12
            }}
            inputColumnSize={{
              lg: 8,
              md: 12
            }}
          />
        </GridItem>
        <GridItem sm={12} md={4} lg={2}>
          <Select<string, CategoryOptionsType>
            {...categoryId}
            label="Category"
            placeholder="Please select category!"
            labelField="name"
            valueField="categoryId"
            name="categoryId"
            options={categories}
            labelColumnSize= {{
              lg: 3,
              md: 12
            }}
            inputColumnSize={{
              lg: 9,
              md: 12
            }}
          />
        </GridItem>
        <GridItem sm={12} md={4} lg={3}>
          <FileDragDropUpload
            {...avatar}
            multiple={false}
            name="avatar"
            label="Avatar"
            className="image-select-box"
            labelColumnSize= {{
              lg: 12
            }}
            inputColumnSize={{
              lg: 12
            }}
          />
        </GridItem>
        <GridItem sm={12} md={12} lg={9}>
          <FileDragDropUpload
            {...images}
            name="images"
            label="Images"
            className="image-select-box"
            labelColumnSize= {{
              lg: 12
            }}
            inputColumnSize={{
              lg: 12
            }}
          />
        </GridItem>
      </Grid>
    </Form>
  );
}

export default BookInformation;
