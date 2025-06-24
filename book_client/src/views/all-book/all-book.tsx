import { JSX, useState } from 'react';
import { AxiosResponse } from 'axios';
import Books from 'components/re-use/books/books';
import { useClientPaginationContext } from 'contexts/client-pagination';
import useComponentWillMount from 'hooks/useComponentWillMount';
import { bookPagination } from './fetcher';
import { HaveLoadedFnType, BookPropsType, PaginationCondition } from 'interfaces';

type PaginationType = {
  page: number;
  pages: number;
  list: BookPropsType[];
};

function AllBooks(): JSX.Element {
  const { setOnPageChange, setPage, setPages, condition } = useClientPaginationContext();
  const [books, setBooks] = useState<BookPropsType[]>([]);

  const pagination = (): (pageNumber?: number) => Promise<void> => {
    return (pageNumber: number = 1, currentCondition: PaginationCondition = condition) =>
       bookPagination(pageNumber, currentCondition)
        .then((result: AxiosResponse<PaginationType>) => {
          setPage(result.data.page);
          setPages(result.data.pages);
          setBooks(result.data.list);
        })
        .catch((error) => {
          setPage(error.response.data.page);
          setPages(error.response.data.pages);
          setBooks(error.response.data.list);
        });
  };

  useComponentWillMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        setOnPageChange(pagination);
        pagination()();
      }
    };
  }, []);

  return (<Books items={books} />);
}

export default AllBooks;
