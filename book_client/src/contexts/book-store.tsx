import { JSX, createContext, useContext, ReactElement, useSyncExternalStore } from 'react';
import store, { CurrentStoreType } from 'store/book';
const {
  updateConditionNavigate,
  updateDisableStep,
  updateData,
  deleteAllStorage,
  updateBookInfo,
  updateStep,
  subscribe,
  getSnapshot
} = store;

type BookStoreContextPropsType = {
  children: ReactElement;
};

type BookStoreContextValueType = {
  data: CurrentStoreType['data'];
  step: CurrentStoreType['step'];
  disableStep: CurrentStoreType['disableStep'];
  updateConditionNavigate: typeof store.updateConditionNavigate;
  deleteAllStorage: typeof store.deleteAllStorage;
  updateDisableStep: typeof store.updateDisableStep;
  updateStep: typeof store.updateStep;
  updateData: typeof store.updateData;
  updateBookInfo: typeof store.updateBookInfo;
};

const BookStoreContext = createContext<BookStoreContextValueType | null>(null);

export const useBookStoreContext =
  (): BookStoreContextValueType => useContext(BookStoreContext) as BookStoreContextValueType;

export default ({ children }: BookStoreContextPropsType): JSX.Element => {
  const { data, step, disableStep }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);

  const bookStore: BookStoreContextValueType = {
    data,
    step,
    disableStep,
    updateConditionNavigate,
    deleteAllStorage,
    updateDisableStep,
    updateStep,
    updateData,
    updateBookInfo,
  };

  return (
    <BookStoreContext.Provider value={bookStore}>
      { children }
    </BookStoreContext.Provider>
  );
};
