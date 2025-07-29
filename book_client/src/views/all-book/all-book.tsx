import { JSX, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import Books from 'components/re-use/books/books';
import { useClientPaginationContext } from 'contexts/client-pagination';
import useComponentDidMount from 'hooks/useComponentWillMount';
import { bookPagination } from './fetcher';
import path from 'router/paths';
import { HaveLoadedFnType, BookPropsType, PaginationCondition } from 'interfaces';

type PaginationType = {
  page: number;
  pages: number;
  list: BookPropsType[];
};

function AllBooks(): JSX.Element {
  const {
    setOnPageChange,
    setPage,
    setPages,
    clearOldKeyword,
    getConditions
  } = useClientPaginationContext();
  const [books, setBooks] = useState<BookPropsType[]>([]);

  const pagination = (): (pageNumber?: number) => Promise<void> => {
    return (pageNumber: number = 1, currentCondition: PaginationCondition = getConditions()) =>
       bookPagination(pageNumber, currentCondition)
        .then((result: AxiosResponse<PaginationType>) => {
          setPage(result.data.page);
          setPages(result.data.pages);
          setBooks(result.data.list);
        });
  };

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        setOnPageChange(pagination);
        pagination()();
      }
    };
  }, []);

  useBlocker(({ currentLocation, nextLocation }): boolean => {
    if (currentLocation.pathname !== nextLocation.pathname
      && (nextLocation.pathname.includes(path.AUTHOR) || nextLocation.pathname.includes(path.BOOK))
    ) {
      clearOldKeyword && clearOldKeyword();
    }
    return false;
  });

  return (<Books items={books} />);
}

export default AllBooks;
