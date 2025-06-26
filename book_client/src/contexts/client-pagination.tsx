import { Dispatch, JSX, ReactElement, ReactNode, createContext, useContext, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

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
  page: number;
  pages: number;
  condition: PaginationCondition;
  keyword: string;
  resultFor: ReactNode;
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
      page,
      pages,
      condition,
      keyword,
      resultFor
    }}>
      {children}
    </ClientPaginationContext.Provider>
  );
}

export default ClientPagination;
