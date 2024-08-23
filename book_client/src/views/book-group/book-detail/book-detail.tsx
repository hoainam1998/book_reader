import { JSX, useSyncExternalStore } from 'react';
import BookInformation from './book-information/book-information';
import BookIntroduce from './book-introduce/book-introduce';
import BookConclusion from './book-conclusion/book-conclusion';
import Stepper, { StepContent } from 'components/stepper/stepper';
import useForm, { RuleType } from 'hooks/useForm';
import { required } from 'hooks/useValidate';
import { loadAllCategory, getBookDetail, saveBookInformation, shouldRevalidateBookLoader } from './fetcher';
import store, { CurrentStoreType } from './storage';
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

  const { step }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);

  const onSubmit = (formData: FormData): void => {
    handleSubmit();

    if (!validate.error) {
      saveBookInformation(formData)
        .then(res => {
          const bookId: string = res.data.bookId;
          getBookDetail(bookId)
            .then(res => updateBookInfo({ data: res.data.book.detail, step: 2 }));
        });
    }
  };

  return (
    <Stepper
      stepNumber={3}
      onSwitch={(step) => updateStep(step)}
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
