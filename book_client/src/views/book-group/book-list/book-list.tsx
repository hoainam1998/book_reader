import { JSX, useCallback, useMemo, useLayoutEffect } from 'react';
import { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import paths from 'router/paths';
import { bookPagination, getBookDetail } from '../fetcher';
import store from 'store/book';
const { updateData, deleteAllStorage } = store;
import { openFile, showToast } from 'utils';
import './style.scss';

type BookType = {
  bookId: string;
  avatar: string;
  name: string;
  pdf: string;
  publishedDay: string;
  publishedTime: number;
  category: {
    avatar: string;
    name: string;
  };
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
      return fetcher.data.data.list;
    }
    return (loaderData as AxiosResponse).data.list || [];
  }, [fetcher.data, loaderData.data]);

  const total = useMemo<number>(() => {
    if (fetcher.data) {
      return fetcher.data.data.total;
    }
    return (loaderData as AxiosResponse).data.total || 0;
  }, [fetcher.data, loaderData.data]);

  const operationSlot = useCallback((slotProp: BookType): JSX.Element => {
    const { bookId } = slotProp;

    const getBookInformation = (): void => {
      getBookDetail(bookId, true)
        .then((res) => {
          updateData({ ...res.data, bookId });
          navigate(bookId);
        })
        .catch((err) => showToast('Book', err.response.data.message));
    };

    return (
      <div>
        <Button variant="success" onClick={getBookInformation}>
          Update
        </Button>
        &nbsp;&nbsp;
        <Button variant="dangerous" onClick={() => {}}>
          Delete
        </Button>
      </div>
    );
  }, []);

  const fetchBookPagination = (pageSize: number, pageNumber: number): void => {
    _pageSize = pageSize;
    fetcher.submit({ pageSize, pageNumber, keyword: _keyword });
  };

  const search = useCallback((keyword: string): void => {
    _keyword = keyword;
    fetchBookPagination(_pageSize, 1);
  }, []);

  useLayoutEffect(() => {
    deleteAllStorage(true);
  }, []);

  return (
    <section className="book-list">
      <HeaderDashboard disabled={total === 0} add={() => navigate(paths.NEW)} search={search} />
      <Table<BookType>
        key={_keyword}
        responsive
        fields={fields}
        data={books}
        total={total}
        emptyMessage="Books are not found!"
        onLoad={fetchBookPagination}>
          <Slot<BookType>
            name="avatar"
            render={(slotProp) => (
              <img height="50px" width="50px" src={slotProp.avatar} alt="book-avatar" />
            )}/>
          <Slot<BookType>
            name="category"
            render={(slotProp) => (
              <div className="category-cell">
                <img height="30px" width="30px" src={slotProp.category.avatar} alt="category-avatar" />
                <span>{slotProp.category.name}</span>
              </div>
            )}/>
          <Slot<BookType>
            name="pdf"
            render={(slotProp) => (
              <Button variant="success" disabled={!slotProp.pdf} onClick={() => openFile(slotProp.pdf)}>
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
              <Button variant="success" disabled={!slotProp.introduce} onClick={() => openFile(slotProp.introduce)}>
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
