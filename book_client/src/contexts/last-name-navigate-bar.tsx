import { Dispatch, JSX, ReactElement, SetStateAction, createContext, useContext, useState } from 'react';

type LastNavigateNameContextPropsType = {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
};

type LastNameNavigateBarPropsType = {
  children: ReactElement;
};

const LastNavigateNameContext = createContext<LastNavigateNameContextPropsType | null>(null);

export const useLastNavigateNameContext = (): LastNavigateNameContextPropsType =>
  useContext(LastNavigateNameContext) as LastNavigateNameContextPropsType;

export default ({ children }: LastNameNavigateBarPropsType): JSX.Element => {
  const [name, setName] = useState<string>('');

  return (
    <LastNavigateNameContext.Provider value={{ name, setName }}>
      {children}
    </LastNavigateNameContext.Provider>
  );
};
