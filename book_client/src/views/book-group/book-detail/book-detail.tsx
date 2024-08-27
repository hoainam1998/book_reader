import { JSX, useCallback, useSyncExternalStore, useEffect } from 'react';
import BookInformation from './book-information/book-information';
import BookIntroduce from './book-introduce/book-introduce';
import BookConclusion from './book-conclusion/book-conclusion';
import Stepper, { StepContent } from 'components/stepper/stepper';
import useForm, { RuleType } from 'hooks/useForm';
import { required } from 'hooks/useValidate';
import {
  loadAllCategory,
  getBookDetail,
  saveBookInformation,
  shouldRevalidateBookLoader
} from './fetcher';
import store, { CurrentStoreType, Image } from './storage';
import './style.scss';

type BookStateType = {
  name: string;
  pdf: File | null;
  publishedDay: number | null;
  publishedTime: number | null;
  categoryId: string;
  images: File[] | null;
};

const state: BookStateType = {
  name: '',
  pdf: null,
  publishedDay: null,
  publishedTime: null,
  categoryId: '',
  images: null
};

const rules: RuleType<BookStateType> = {
  name: { required },
  pdf: { required },
  publishedDay: { required },
  publishedTime: { required },
  categoryId: { required },
  images: { required }
};

const formId: string = 'book-detail-form';

/**
 * Convert base64 image string list to promise all file list.
 *
 * @param {Image[]} base64String - base64 string chain.
 * @returns {Promise<File[]>} - promise all file list.
 */
const convertBase64ImageToFile = (base64String: Image[]): Promise<File[]> => {
  const imagesPromise: Promise<File>[] = base64String.map(({ image, name }) => {
    return new Promise((resolve, reject) => {
      fetch(image)
      .then(res => res.blob())
      .then(blob => resolve(new File([blob], name, { type: blob.type })))
      .catch(err => reject(err));
    });
  });
  return Promise.all(imagesPromise);
};

/**
 * Convert url to promise file.
 *
 * @param {string} filePath - url link to file.
 * @returns {Promise<File>} - promise include file.
 */
const convertFilePathToFile = (filePath: string, name: string): Promise<File> => {
  return new Promise((resolve, reject) => {
    fetch(filePath)
    .then(res => res.blob())
    .then(blob => {
      const fileName: string = `${name}${blob.type.match(/(?=\/)(.\w+)/g)![0].replace('/', '.')}`
      resolve(new File([blob], fileName));
    })
    .catch(err => reject(err));
  });
};

function BookDetail(): JSX.Element {
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
  const { subscribe, getSnapshot, updateBookInfo, updateStep } = store;
  const { data, step }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);

  const onSubmit = useCallback((formData: FormData): void => {
    handleSubmit();

    if (!validate.error) {
      saveBookInformation(formData)
        .then(res => {
          const bookId: string = res.data.bookId;
          getBookDetail(bookId)
            .then(res => updateBookInfo({ data: {... res.data.book.detail, bookId }, step: 2 }));
        });
    }
  }, [validate.error]);

  useEffect(() => {
    if (data) {
      name.watch(data.name);
      publishedTime.watch(data.publishedTime);
      publishedDay.watch(+data.publishedDay);
      categoryId.watch(data.categoryId);
      pdf.watch('');
      images.watch('');
      convertFilePathToFile(`${process.env.BASE_URL}/${data.pdf}`, data.name)
        .then(res => pdf.watch(res));
      convertBase64ImageToFile(data.images)
        .then(res => images.watch(res));
    }
  }, []);

  return (
    <Stepper
      stepNumber={3}
      onSwitch={updateStep}
      activeStep={step}
      className="book-detail-stepper">
      <StepContent step={1}>
        <BookInformation
          name={name}
          pdf={pdf}
          categoryId={categoryId}
          publishedTime={publishedTime}
          publishedDay={publishedDay}
          images={images}
          onSubmit={onSubmit}
          onReset={reset} />
      </StepContent>
      <StepContent step={2}>
        <BookIntroduce />
      </StepContent>
      <StepContent step={3}>
        <BookConclusion />
      </StepContent>
    </Stepper>
  );
}

export { loadAllCategory, shouldRevalidateBookLoader };
export default BookDetail;
