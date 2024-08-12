import { JSX, useState } from 'react';
import BookInformation from './book-information/book-information';
import Stepper, { StepContent } from 'components/stepper/stepper';
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

  const [step, setStep] = useState<number>(1);

  const onSubmit = (): void => {
    handleSubmit();
  };

  return (
    <>
      <Stepper stepNumber={3} onSwitch={(step) => setStep(step)} activeStep={1} className="book-detail-stepper">
        <BookInformation
          onSubmit={onSubmit}
          name={name}
          categoryId={categoryId}
          publishedTime={publishedTime}
          publishedDay={publishedDay}
          pdf={pdf} />
        <StepContent step={1}><div>step 1</div></StepContent>
        <StepContent step={2}><div>step 2</div></StepContent>
      </Stepper>
    </>
  );
}

export default BookDetail;
