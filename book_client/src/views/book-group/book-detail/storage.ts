export type CurrentStoreType = {
  step: number;
  data: FormData;
  isComplete: boolean;
};

type ListenerType = (() => void)[];

console.log(localStorage.getItem('book-introduce-data'));

const initStore: CurrentStoreType = {
  step: +(localStorage.getItem('step') || '1'),
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
    localStorage.setItem('step', currentStep.toString());
    emitChange(store.listeners);
  },
  updateData(data: FormData): void {
    store.currentStore = { ...store.currentStore, data };
    localStorage.setItem('book-introduce-data', JSON.stringify(data));
  },
  subscribe(callback: () => void): () => void {
    store.listeners = [...store.listeners, callback];
    return () => {
      store.currentStore.isComplete && localStorage.removeItem('step');
    };
  },
  getSnapshot(): CurrentStoreType {
    return store.currentStore;
  }
};

export default store;
