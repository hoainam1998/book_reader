import { JSX, useCallback, useMemo, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import Input from 'components/form/form-control/input/input';
import { bookPagination } from './fetcher';
import { format } from 'date-fns';
import './style.scss';

type BookType = {
  bookId: string;
  avatar: string;
  name: string;
  pdf: string;
  publishedDay: string;
  publishedTime: number;
  category: string;
  introduce: string;
};

const fields: Field[] = [
  {
    key: 'avatar'
  },
  {
    key: 'name'
  },
  {
    key: 'pdf'
  },
  {
    key: 'publishedDay',
    label: 'Published day'
  },
  {
    key: 'publishedTime',
    label: 'Published time'
  },
  {
    key: 'category'
  },
  {
    key: 'introduce'
  },
  {
    key: 'operation',
    width: 150,
    style: {
      color: 'transparent',
      userSelect: 'none'
    }
  }
];

function BookList(): JSX.Element {
  const [keyword, setKeyword] = useState<string>('');
  const fetcher = useFetcher();
  const loaderData = useLoaderData() as AxiosResponse;
  const navigate = useNavigate();

  const books = useMemo<BookType[]>(() => {
    if (fetcher.data) {
      return fetcher.data.data.book.pagination.list;
    }
    return loaderData?.data.book.pagination.list || [];
  }, [fetcher.data]);

  const total = useMemo<number>(() => {
    if (fetcher.data) {
      return fetcher.data.data.book.pagination.total;
    }
    return loaderData?.data.book.pagination.total || 0;
  }, [fetcher.data]);

  const operationSlot = useCallback((slotProp: BookType): JSX.Element => {
    const { bookId } = slotProp;

    return (
      <>
        <Button variant="success" onClick={() => {}}>
          Update
        </Button>
        &nbsp;&nbsp;
        <Button variant="dangerous" onClick={() => {}}>
          Delete
        </Button>
      </>
    );
  }, []);

  const fetchBookPagination = (pageSize: number, pageNumber: number): void => {
    fetcher.submit({ pageSize, pageNumber, keyword });
  };

  const previewFile = useCallback((pdf: string): void => {
    window.open(`${process.env.BASE_URL}/${pdf}`, '_blank');
  }, []);

  const search = useCallback((): void => {
    fetcher.submit({ pageSize: 10, pageNumber: 1, keyword });
  }, [keyword]);

  return (
    <section>
      <div className="book-list-header">
        <Button variant="success" className="add-new" onClick={() => navigate('new')}>+New</Button>
        <Input label="" name="search" labelClass="label-search" onBlur={(value) => setKeyword(value as string)} />
        <Button variant="outline" className="btn-search" onClick={search}>&#128270;</Button>
      </div>
      <Table fields={fields} data={books} total={total} onLoad={fetchBookPagination} key={keyword}>
        <Slot<BookType>
          name="avatar"
          render={(slotProp) => (
            <img height="50px" width="50px" src={slotProp.avatar} alt="book-avatar" />
          )}/>
        <Slot<BookType>
          name="pdf"
          render={(slotProp) => (
            <Button variant="success" onClick={() => previewFile(slotProp.pdf)}>
              Preview
            </Button>
          )}/>
        <Slot<BookType>
          name="publishedDay"
          render={(slotProp) => format(+slotProp.publishedDay, 'dd-MM-yyyy')
          }/>
        <Slot<BookType>
          name="introduce"
          render={(slotProp) => (
            <Button variant="success" onClick={() => previewFile(slotProp.introduce)}>
              Preview
            </Button>
          )}/>
        <Slot name="operation" render={operationSlot} />
      </Table>
    </section>
  );
}

export { bookPagination };
export default BookList;
