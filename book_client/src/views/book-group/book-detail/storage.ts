import { StepStorage } from 'storage';

export type CurrentStoreType = {
  step: number;
  data: any;
  isComplete?: boolean;
};

type BookInfo = {
  step: number;
  data: any;
};

type ListenerType = (() => void)[];

const initStore: CurrentStoreType = {
  step: +StepStorage.getItem() || 1,
  data: JSON.parse(localStorage.getItem('book-introduce-data')!),
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
  updateData(data: FormData): void {
    store.currentStore = { ...store.currentStore, data };
    localStorage.setItem('book-introduce-data', JSON.stringify(data));
    emitChange(store.listeners);
  },
  updateBookInfo(newStore: BookInfo): void {
    store.updateStep(newStore.step);
    store.updateData({...newStore.data, images: 'images' });
    emitChange(store.listeners);
  },
  subscribe(callback: () => void): () => void {
    store.listeners = [...store.listeners, callback];
    return () => {
      store.currentStore.isComplete && StepStorage.delete();
    };
  },
  getSnapshot(): CurrentStoreType {
    return store.currentStore;
  }
};

export default store;
