import { JSX, createContext, useContext, ReactElement } from 'react';
import { Blocker, useBlocker } from 'react-router-dom';

const BlockerContext = createContext<Blocker | unknown>(null);

type BlockerContextPropsType = {
  children: ReactElement;
  isNavigate: boolean;
};

export const useBlockerContext = (): Blocker => useContext(BlockerContext) as Blocker;

export default ({ children, isNavigate }: BlockerContextPropsType): JSX.Element => {

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
