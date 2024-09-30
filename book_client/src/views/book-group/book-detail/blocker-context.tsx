import { createContext, useContext, ReactElement, useSyncExternalStore } from 'react';
import { Blocker, useBlocker } from 'react-router-dom';
import store, { CurrentStoreType } from '../storage';
const { subscribe, getSnapshot } = store;

const BlockerContext = createContext<Blocker | unknown>(null);

type BlockerContextPropsType = {
  children: ReactElement;
};

export const useBlockerContext = (): Blocker => useContext(BlockerContext) as Blocker;

export default ({ children }: BlockerContextPropsType): JSX.Element => {
  const { isNavigate }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);

  const blocker: Blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const currentPathname: string = currentLocation.pathname;
    const nextPathname: string = nextLocation.pathname;
    const isBlocked: boolean = currentPathname !== nextPathname;
    return isNavigate && isBlocked;
  });

  return (
    <BlockerContext.Provider value={blocker}>
      { children }
    </BlockerContext.Provider>
  );
};
