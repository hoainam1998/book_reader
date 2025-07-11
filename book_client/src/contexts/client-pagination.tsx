import { Dispatch, JSX, ReactElement, ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import path from 'router/paths';

export type PaginationCondition = {
  id?: string;
  keyword?: string;
};

type ClientPaginationPropsType = {
  children: ReactElement;
};

type ClientPaginationContextPropsType = {
  onPageChange?: ((pageNumber: number, condition?: PaginationCondition) => void) | null;
  setOnPageChange: Dispatch<ClientPaginationContextPropsType['onPageChange']>;
  setPage: Dispatch<number>;
  setPages: Dispatch<number>;
  setCondition: Dispatch<PaginationCondition>;
  setClearOldKeyword: Dispatch<ClientPaginationContextPropsType['clearOldKeyword']>;
  setResetPage: Dispatch<ClientPaginationContextPropsType['resetPage']>;
  setResultFor: Dispatch<ClientPaginationContextPropsType['resultFor']>;
  resetPage: (() => void) | null;
  clearOldKeyword: (() => void) | null;
  getConditions: () => { id?: string, keyword: string };
  page: number;
  pages: number;
  condition: PaginationCondition;
  keyword: string;
  resultFor: ReactNode;
  shouldCallOnPageChange: () => boolean;
};

const ClientPaginationContext = createContext<ClientPaginationContextPropsType | null>(null);

export const useClientPaginationContext
  = (): ClientPaginationContextPropsType => useContext(ClientPaginationContext) as ClientPaginationContextPropsType;

function ClientPagination({ children }: ClientPaginationPropsType): JSX.Element {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [onPageChange, setOnPageChange] = useState<ClientPaginationContextPropsType['onPageChange']>(null);
  const [clearOldKeyword, setClearOldKeyword] = useState<ClientPaginationContextPropsType['clearOldKeyword']>(null);
  const [resetPage, setResetPage] = useState<ClientPaginationContextPropsType['resetPage']>(null);
  const [resultFor, setResultFor] = useState<ClientPaginationContextPropsType['resultFor']>('All');
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [condition, setCondition] = useState<PaginationCondition>({ id, keyword });

  const shouldCallOnPageChange = useCallback((): boolean => {
    const oldLocation = window.location.pathname;
    return [path.ALL, path.AUTHORS, path.CATEGORIES].some((p) => oldLocation.includes(p));
  }, [window.location.pathname]);

  const getConditions = () => {
    return {
      id,
      keyword,
    };
  };

  return (
    <ClientPaginationContext.Provider value={{
      onPageChange,
      setOnPageChange,
      setPage,
      setPages,
      setCondition,
      setClearOldKeyword,
      clearOldKeyword,
      setResetPage,
      resetPage,
      setResultFor,
      getConditions,
      page,
      pages,
      condition,
      keyword,
      resultFor,
      shouldCallOnPageChange
    }}>
      {children}
    </ClientPaginationContext.Provider>
  );
}

export default ClientPagination;
