import { StepStorage, BookInfoStorage, BookInfoType } from 'storage';
import type { Image } from 'storage';

export type CurrentStoreType = {
  step: number;
  data: BookInfoType;
  isComplete?: boolean;
};

export { Image };

type BookInfo = {
  step: number;
  data: any;
};

type ListenerType = (() => void)[];

const initStore: CurrentStoreType = {
  step: +StepStorage.getItem() || 1,
  data: BookInfoStorage.getItem(),
  isComplete: false
};

const emitChange = (listeners: ListenerType): void => {
  for (let listener of listeners) {
    listener();
  }
};

const store = {
  currentStore: initStore,
  listeners: [] as ListenerType,
  updateStep(currentStep: number): void {
    store.currentStore = { ...store.currentStore, step: currentStep };
    StepStorage.setItem(currentStep);
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
    emitChange(store.listeners);
  },
  subscribe(callback: () => void): () => void {
    store.listeners = [...store.listeners, callback];
    return () => {
      if (store.currentStore.isComplete) {
        StepStorage.delete();
        BookInfoStorage.delete();
      }
    };
  },
  getSnapshot(): CurrentStoreType {
    return store.currentStore;
  }
};

export default store;
