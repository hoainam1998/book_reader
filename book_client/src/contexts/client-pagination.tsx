import { Dispatch, JSX, ReactElement, createContext, useCallback, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';

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
  setConditions: (currentCondition: PaginationCondition) => void;
  page: number;
  pages: number;
  condition: PaginationCondition;
};

const ClientPaginationContext = createContext<ClientPaginationContextPropsType | null>(null);

export const useClientPaginationContext
  = (): ClientPaginationContextPropsType => useContext(ClientPaginationContext) as ClientPaginationContextPropsType;

function ClientPagination({ children }: ClientPaginationPropsType): JSX.Element {
  const { id } = useParams();
  const [onPageChange, setOnPageChange] = useState<ClientPaginationContextPropsType['onPageChange']>(null);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [condition, setCondition] = useState<PaginationCondition>({ id });

  const setConditions = useCallback((currentCondition: PaginationCondition) => {
    setCondition(currentCondition);
  }, [condition]);

  return (
    <ClientPaginationContext.Provider value={{
      onPageChange,
      setOnPageChange,
      setPage,
      setPages,
      page,
      pages,
      condition,
      setConditions,
    }}>
      {children}
    </ClientPaginationContext.Provider>
  );
}

export default ClientPagination;
