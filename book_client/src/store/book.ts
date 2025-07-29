import { StepStorage, DisableStepStorage, BookInfoStorage, BookInfoType } from 'storage';
import type { Image } from 'storage';
import Store from './store';

export type CurrentStoreType = {
  step: number;
  disableStep: number | false;
  data: BookInfoType;
  isComplete?: boolean;
  isNavigate: boolean;
};

export { Image };

type BookInfo = {
  step: number;
  disableStep: number | false;
  data: BookInfoType;
};

const disableStep: CurrentStoreType['disableStep'] = DisableStepStorage.getItem();

const initStore: () => CurrentStoreType = () => ({
  step: +(StepStorage.getItem() || 1),
  disableStep: (disableStep === false ? false : +disableStep || 2),
  data: BookInfoStorage.getItem(),
  isComplete: false,
  isNavigate: false
});

class BookStore extends Store<CurrentStoreType> {
  constructor() {
    super(initStore());
  }

  updateStep = (currentStep: number): void => {
    this.CurrentStore = { ...this.CurrentStore, step: currentStep };
    StepStorage.setItem(currentStep);
    this.emitChange();
  };

  updateDisableStep = (disableStep: number | false): void => {
    this.CurrentStore = { ...this.CurrentStore, disableStep };
    DisableStepStorage.setItem(disableStep);
    this.emitChange();
  };

  updateData = (data: BookInfoType): void => {
    this.CurrentStore = { ...this.CurrentStore, data };
    BookInfoStorage.setItem(data);
    DisableStepStorage.setItem(false);
    this.emitChange();
  };

  updateBookInfo = (newStore: BookInfo): void => {
    this.updateStep(newStore.step);
    this.updateData(newStore.data);
    this.updateDisableStep(newStore.disableStep);
    this.emitChange();
  };

  updateConditionNavigate = (isNavigate: boolean): void => {
    this.CurrentStore = { ...this.CurrentStore, isNavigate };
    this.emitChange();
  };

  deleteAllStorage = (isComplete: boolean = false): void  => {
    StepStorage.delete();
    BookInfoStorage.delete();
    DisableStepStorage.delete();
    this.CurrentStore = {
      ...initStore(),
      isComplete
    };
    this.emitChange();
  };
};

export default new BookStore();
