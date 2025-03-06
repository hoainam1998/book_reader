/* eslint-disable no-unused-vars */
import { JSX, useLayoutEffect, useSyncExternalStore } from 'react';
import { useParams, useNavigation } from 'react-router-dom';
import BookInformation from './book-information/book-information';
import BookIntroduce from './book-introduce/book-introduce';
import BookConclusion from './book-conclusion/book-conclusion';
import Stepper, { StepContent } from 'components/stepper/stepper';
import {
  loadAllCategory
} from '../fetcher';
import store, { CurrentStoreType } from 'store/book';
import BlockerProvider from 'contexts/blocker';
import './style.scss';
const { subscribe, getSnapshot, updateDisableStep, updateStep, deleteAllStorage } = store;

function BookDetail(): JSX.Element {
  const navigation = useNavigation();
  const { step, disableStep, isNavigate }: CurrentStoreType
    = useSyncExternalStore(subscribe, getSnapshot);
  const { id } = useParams();

  useLayoutEffect(() => {
    let timeout;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (navigation.state === 'loading') {
        updateDisableStep(2);
        updateStep(1);
      } else if (navigation.state === 'idle') {
        updateDisableStep(id ? false : 2);
        updateStep(step);
      }
    }, 100);

  }, [navigation.state]);

  return (
    <BlockerProvider isNavigate={isNavigate}>
      <Stepper
        stepNumber={3}
        onSwitch={updateStep}
        activeStep={step}
        disableStep={disableStep}
        sticky
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

export { loadAllCategory };
export default BookDetail;
