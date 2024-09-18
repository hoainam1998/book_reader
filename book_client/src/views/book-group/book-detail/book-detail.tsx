import { JSX, useSyncExternalStore } from 'react';
import BookInformation from './book-information/book-information';
import BookIntroduce from './book-introduce/book-introduce';
import BookConclusion from './book-conclusion/book-conclusion';
import Stepper, { StepContent } from 'components/stepper/stepper';
import {
  loadAllCategory,
  shouldRevalidateBookLoader
} from './fetcher';
import store, { CurrentStoreType } from '../storage';
import BlockerProvider from './blocker-context';
import './style.scss';
const { subscribe, getSnapshot, updateStep } = store;

function BookDetail(): JSX.Element {
  const { step, disableStep }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <BlockerProvider>
      <Stepper
        stepNumber={3}
        onSwitch={updateStep}
        activeStep={step}
        disableStep={disableStep}
        className="book-detail-stepper">
        <StepContent step={1}>
          <BookInformation />
        </StepContent>
        <StepContent step={2}>
          <BookIntroduce />
        </StepContent>
        <StepContent step={3}>
          <BookConclusion />
        </StepContent>
      </Stepper>
    </BlockerProvider>
  );
}

export { loadAllCategory, shouldRevalidateBookLoader };
export default BookDetail;
