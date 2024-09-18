import { StepStorage, DisableStepStorage, BookInfoStorage, BookInfoType } from 'storage';
import type { Image } from 'storage';

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
  disableStep: number;
  data: BookInfoType;
};

type ListenerType = (() => void)[];

type BookStoreType = {
  currentStore: CurrentStoreType;
  listeners: ListenerType;
  updateStep: (step: number) => void;
  updateDisableStep: (step: number | false) => void;
  updateData: (data: BookInfoType) => void;
  updateBookInfo: (store: BookInfo) => void;
  updateConditionNavigate: (isNavigate: boolean) => void;
  deleteAllStorage: (isComplete: boolean) => void;
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => CurrentStoreType;
};

const disableStep: CurrentStoreType['disableStep'] = DisableStepStorage.getItem();
const initStore: () => CurrentStoreType = () => ({
  step: +(StepStorage.getItem() || 1),
  disableStep: (disableStep === false ? false : +disableStep || 2),
  data: BookInfoStorage.getItem(),
  isComplete: false,
  isNavigate: false
});

const emitChange = (listeners: ListenerType): void => {
  for (let listener of listeners) {
    listener();
  }
};

const store: BookStoreType = {
  currentStore: initStore(),
  listeners: [] as ListenerType,
  updateStep(currentStep: number): void {
    store.currentStore = { ...store.currentStore, step: currentStep };
    StepStorage.setItem(currentStep);
    emitChange(store.listeners);
  },
  updateDisableStep(disableStep: number | false): void {
    store.currentStore = { ...store.currentStore, disableStep };
    DisableStepStorage.setItem(disableStep);
    emitChange(store.listeners);
  },
  updateData(data: BookInfoType): void {
    store.currentStore = { ...store.currentStore, data };
    BookInfoStorage.setItem(data);
    emitChange(store.listeners);
  },
  updateBookInfo(newStore: BookInfo): void {
    store.updateStep(newStore.step);
    store.updateData(newStore.data);
    store.updateDisableStep(newStore.disableStep);
    emitChange(store.listeners);
  },
  updateConditionNavigate(isNavigate: boolean): void {
    store.currentStore = { ...store.currentStore, isNavigate };
    emitChange(store.listeners);
  },
  deleteAllStorage(isComplete: boolean): void {
    StepStorage.delete();
    BookInfoStorage.delete();
    DisableStepStorage.delete();
    store.currentStore = {
      ...initStore(),
      isComplete
    };
    emitChange(store.listeners);
  },
  subscribe(callback: () => void): () => void {
    store.listeners = [...store.listeners, callback];
    return () => {};
  },
  getSnapshot(): CurrentStoreType {
    return store.currentStore;
  }
};

export default store;
