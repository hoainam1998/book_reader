import { Fragment, JSX, useCallback, useState } from 'react';
import { AxiosResponse } from 'axios';
import Tabs, { Tab, TabHeader } from 'components/tabs/tabs';
import HorizontalBookGrid from 'components/re-use/horizontal-book-grid/horizontal-book-grid';
import useComponentDidMount from 'hooks/useComponentDidMount';
import Personal from '../personal';
import { showToast } from 'utils';
import { updatePerson as _updatePerson } from '../fetcher';
import {
  getAllReaders,
  getReaderDetail,
  getReaderInformation,
  deleteFavoriteBook,
  deleteReadLateBook,
  deleteUsedReadBook,
  getFavoriteBooks,
  getReadLateBooks,
  getUsedReadBooks,
} from './fetcher';
import { logout } from 'views/login-group/login/client-login/fetcher';
import { HaveLoadedFnType, PersonalType, HorizontalBookType } from 'interfaces';

type ReaderType = PersonalType & {
  favoriteBooks: HorizontalBookType[];
  readLate: HorizontalBookType[];
  usedRead: HorizontalBookType[];
};

type DeleteBookFn = (bookId: string) => void;

/**
* Incorporate delete function with data list.
*
* @param {Omit<HorizontalBookType, 'deleteBook'>[]} items - The data list.
* @param {DeleteBookFn} - The delete function.
* @returns {HorizontalBookType[]} - The new data list.
*/
const combineDeleteBook =
  (items: Omit<HorizontalBookType, 'deleteBook'>[], deleteBookFn: DeleteBookFn): HorizontalBookType[] => {
    const deleteBook = (bookId: string) => () => deleteBookFn(bookId);
    return items.map((item) => ({ ...item, deleteBook: deleteBook(item.bookId) }));
  };

function ClientPersonal(): JSX.Element {
  const [reader, setReader] = useState<PersonalType | null>(null);
  const [favoriteBooks, setFavoriteBooks] = useState<ReaderType['favoriteBooks']>([]);
  const [readLateBooks, setReadLateBooks] = useState<ReaderType['readLate']>([]);
  const [usedReadBooks, setUsedReadBooks] = useState<ReaderType['usedRead']>([]);

  const deleteFavoriteBookService = useCallback((bookId: string): void => {
    deleteFavoriteBook(bookId)
      .then((response) => {
        showToast('Delete favorite book!', response.data.message);
        getFavoriteBooks()
          .then((response) => setFavoriteBooks(combineDeleteBook(response.data, deleteFavoriteBookService)))
          .catch(() => setFavoriteBooks([]));
      })
      .catch((error) => showToast('Delete favorite book!', error.response.data.message));
  }, []);

  const deleteReadLateBookService = useCallback((bookId: string): void => {
    deleteReadLateBook(bookId)
      .then((response) => {
        showToast('Delete read late book!', response.data.message);
        getReadLateBooks()
          .then((response) => setReadLateBooks(combineDeleteBook(response.data, deleteReadLateBookService)))
          .catch(() => setReadLateBooks([]));
      })
      .catch((error) => showToast('Delete read late book!', error.response.data.message));
  }, []);

  const deleteUsedBookService = useCallback((bookId: string): void => {
    deleteUsedReadBook(bookId)
      .then((response) => {
        showToast('Delete used read book!', response.data.message);
        getUsedReadBooks()
          .then((response) => setUsedReadBooks(combineDeleteBook(response.data, deleteUsedBookService)))
          .catch(() => setUsedReadBooks([]));
      })
      .catch((error) => showToast('Delete used read book!', error.response.data.message));
  }, []);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        getReaderDetail()
          .then((reader) => {
            setReader({ ...reader.data, id: reader.data.clientId });
            setFavoriteBooks(combineDeleteBook(reader.data.favoriteBooks, deleteFavoriteBookService));
            setReadLateBooks(combineDeleteBook(reader.data.readLate, deleteReadLateBookService));
            setUsedReadBooks(combineDeleteBook(reader.data.usedRead, deleteUsedBookService));
          })
          .catch(() => {
            setReader(null);
            setFavoriteBooks([]);
            setReadLateBooks([]);
            setUsedReadBooks([]);
          });
      }
    };
  });

  const updatePerson = useCallback((formData: FormData): Promise<AxiosResponse> => {
    return _updatePerson(formData)
      .then((response) => {
        getReaderInformation()
          .then((reader) => setReader(reader.data))
          .catch(() => setReader(null));
        return response;
      });
  }, []);


  return (
    <Fragment>
      <Personal personal={reader} update={updatePerson} getAllUsers={getAllReaders} logout={logout} />
      <Tabs>
        <Tab title="Favorite books">
          <TabHeader render={(title) => (
            <div className="tab-header-custom">
              <img src={require('images/heart.png')} className="tab-icon" />
              {title}
            </div>
          )} />
          <HorizontalBookGrid items={favoriteBooks} />
        </Tab>
          <Tab title="Used read">
            <TabHeader render={(title) => (
              <div className="tab-header-custom">
                <img src={require('images/watch-later.png')} className="tab-icon" />
                {title}
              </div>
            )} />
            <HorizontalBookGrid items={usedReadBooks} />
          </Tab>
          <Tab title="Read late">
            <TabHeader render={(title) => (
              <div className="tab-header-custom">
                <img src={require('images/select-all.png')} className="tab-icon" />
                {title}
              </div>
            )} />
            <HorizontalBookGrid items={readLateBooks} />
          </Tab>
        </Tabs>
    </Fragment>
  );
}

export default ClientPersonal;
