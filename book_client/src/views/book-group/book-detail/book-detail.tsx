/* eslint-disable no-unused-vars */
import { JSX, useSyncExternalStore } from 'react';
import BookInformation from './book-information/book-information';
import BookIntroduce from './book-introduce/book-introduce';
import BookConclusion from './book-conclusion/book-conclusion';
import Stepper, { StepContent } from 'components/stepper/stepper';
import {
  loadAllCategory,
  shouldRevalidateBookLoader
} from './fetcher';
import store, { CurrentStoreType } from 'store/book';
import BlockerProvider from './blocker-context';
import './style.scss';

function BookDetail(): JSX.Element {
  const { step, disableStep }: CurrentStoreType  = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return (
    <BlockerProvider>
      <Stepper
        stepNumber={3}
        onSwitch={store.updateStep}
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
