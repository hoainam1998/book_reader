import { JSX, useCallback, useMemo } from 'react';
import { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import { bookPagination, getBookDetail } from './fetcher';
import store from '../storage';
import './style.scss';
const { updateData } = store;

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
let _keyword: string = '';
let _pageSize: number = 10;

function BookList(): JSX.Element {
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

    const getBookInformation = (): void => {
      getBookDetail(bookId)
        .then(res => {
          updateData(res.data.book.detail);
          navigate(bookId);
        });
    };

    return (
      <>
        <Button variant="success" onClick={getBookInformation}>
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
    _pageSize = pageSize;
    fetcher.submit({ pageSize, pageNumber, keyword: _keyword });
  };

  const search = useCallback((keyword: string) => {
    _keyword = keyword;
    fetchBookPagination(_pageSize, 1);
  }, []);

  const previewFile = useCallback((pdf: string): void => {
    window.open(`${process.env.BASE_URL}/${pdf}`, '_blank');
  }, []);

  return (
    <section className="book-list">
      <HeaderDashboard add={() => navigate('new')} search={search} />
      <Table fields={fields} data={books} total={total} onLoad={fetchBookPagination} key={_keyword}>
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
