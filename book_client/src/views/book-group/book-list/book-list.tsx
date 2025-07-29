import { JSX, useCallback, useLayoutEffect } from 'react';
import { AxiosResponse } from 'axios';
import { useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import paths from 'router/paths';
import useFetchDataTable from 'hooks/useFetchDataTable';
import { bookPagination, getBookDetail, deleteBook } from '../fetcher';
import store from 'store/book';
const { updateData, deleteAllStorage } = store;
import { openFile, showToast, showModal, formatDate } from 'utils';
import { SCREEN_SIZE } from 'enums';
import { ModalSlotPropsType } from 'interfaces';
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

function BookList(): JSX.Element {
  const loaderData = useLoaderData() as AxiosResponse;
  const navigate = useNavigate();
  const { fetcherData, fetch, pageSelected } = useFetchDataTable();

  const books: BookType[] = (fetcherData || loaderData).data.list;
  const total: number = (fetcherData || loaderData).data.total;

  const search = useCallback((keyword: string): void => {
    fetch({ pageNumber: 1, keyword });
  }, [fetch]);

  const operationSlot = useCallback((slotProp: BookType): JSX.Element => {
    const { bookId } = slotProp;

    const getBookInformation = (): void => {
      getBookDetail(bookId, true)
        .then((res) => {
          updateData({ ...res.data, bookId });
          navigate(bookId);
        })
        .catch((err) => showToast('Book detail!', err.response.data.message));
    };

    const deleteBookClick = (onClose: ModalSlotPropsType['onClose']): void => {
      deleteBook(bookId)
        .then((res) => {
          showToast('Delete book success!', res.data.message);
          fetch({ pageNumber: 1 });
        })
        .catch((error) => showToast('Delete book failed!', error.response.data.message))
        .finally(onClose);
    };

    const deleteBookModalChildren: JSX.Element =
      (<>
        <Slot<ModalSlotPropsType> name="body" render={() => (
          <p className="text-center">This book will permanently delete out of system!<br/>Are you sure delete it.</p>
        )} />
        <Slot<ModalSlotPropsType>
            name="footer"
            render={({ onClose }) => (
              <div className="footer-delete-book-modal">
                <Button variant="success" className="flex-grow-1" onClick={onClose}>
                  Close
                </Button>
                <Button variant="dangerous" className="flex-grow-1"
                  onClick={() => deleteBookClick(onClose)}>
                  Delete
                </Button>
              </div>
            )}
          />
      </>);

    const showModalWarningDeleteBook = (): void => {
      showModal({
        title: 'Delete book!',
        children: deleteBookModalChildren,
        size: SCREEN_SIZE.SMALL,
      });
    };

    return (
      <div>
        <Button variant="success" onClick={getBookInformation}>
          Update
        </Button>
        &nbsp;&nbsp;
        <Button variant="dangerous" onClick={showModalWarningDeleteBook}>
          Delete
        </Button>
      </div>
    );
  }, []);

  useLayoutEffect(() => deleteAllStorage(true), []);

  return (
    <section className="book-list">
      <HeaderDashboard disabled={total === 0} add={() => navigate(paths.NEW)} search={search} />
      <Table<BookType>
        responsive
        fields={fields}
        pageSelected={pageSelected}
        data={books}
        total={total}
        emptyMessage="Books are not found!"
        onLoad={fetch}>
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
            render={(slotProp) => formatDate(slotProp.publishedDay)
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
