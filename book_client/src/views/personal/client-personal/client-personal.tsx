import { Fragment, JSX, useState } from 'react';
import Tabs, { Tab, TabHeader } from 'components/tabs/tabs';
import HorizontalBookGrid from 'components/re-use/horizontal-book-grid/horizontal-book-grid';
import useComponentDidMount from 'hooks/useComponentDidMount';
import Personal from '../personal';
import { updatePerson } from '../fetcher';
import { getAllReaders, getReaderDetail } from './fetcher';
import { HaveLoadedFnType, PersonalType, HorizontalBookType } from 'interfaces';

type ReaderType = PersonalType & {
  favoriteBooks: HorizontalBookType[];
  readLate: HorizontalBookType[];
  usedRead: HorizontalBookType[];
};

function ClientPersonal(): JSX.Element {
  const [reader, setReader] = useState<PersonalType | null>(null);
  const [favoriteBooks, setFavoriteBooks] = useState<ReaderType['favoriteBooks']>([]);
  const [readLate, setReadLate] = useState<ReaderType['readLate']>([]);
  const [usedRead, setUsedRead] = useState<ReaderType['usedRead']>([]);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        getReaderDetail()
          .then((reader) => {
            setReader(reader.data);
            setFavoriteBooks(reader.data.favoriteBooks);
            setReadLate(reader.data.readLate);
            setUsedRead(reader.data.usedRead);
          })
          .catch(() => {
            setReader(null);
            setFavoriteBooks([]);
            setReadLate([]);
            setUsedRead([]);
          });
      }
    };
  });

  return (
    <Fragment>
      <Personal personal={reader} update={updatePerson} getAllUsers={getAllReaders} />
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
            <HorizontalBookGrid items={usedRead} />
          </Tab>
          <Tab title="Read late">
            <TabHeader render={(title) => (
              <div className="tab-header-custom">
                <img src={require('images/select-all.png')} className="tab-icon" />
                {title}
              </div>
            )} />
            <HorizontalBookGrid items={readLate} />
          </Tab>
        </Tabs>
    </Fragment>
  );
}

export default ClientPersonal;
