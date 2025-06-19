import { Fragment, JSX } from 'react';
import Tabs, { Tab, TabHeader } from 'components/tabs/tabs';
import HorizontalBookGrid from 'components/re-use/horizontal-book-grid/horizontal-book-grid';
import HorizontalBook from 'components/re-use/horizontal-book/horizontal-book';
import Personal from '../personal';
import { updatePerson } from '../fetcher';
import { getAllReaders } from './fetcher';

function ClientPersonal(): JSX.Element {
  return (
    <Fragment>
      <Personal update={updatePerson} getAllUsers={getAllReaders} />
      <Tabs>
          <Tab title="tab1">
            <TabHeader render={(title) => (
              <div className="tab-header-custom">
                <img src={require('images/heart.png')} className="tab-icon" />
                {title}
              </div>
            )} />
            <HorizontalBookGrid>
              <HorizontalBook />
              <HorizontalBook />
              <HorizontalBook />
              <HorizontalBook />
              <HorizontalBook />
            </HorizontalBookGrid>
          </Tab>
          <Tab title="tab1">
            <TabHeader render={(title) => (
              <div className="tab-header-custom">
                <img src={require('images/watch-later.png')} className="tab-icon" />
                {title}
              </div>
            )} />
            <div>body tab 2</div>
          </Tab>
          <Tab title="tab1">
            <TabHeader render={(title) => (
              <div className="tab-header-custom">
                <img src={require('images/select-all.png')} className="tab-icon" />
                {title}
              </div>
            )} />
            <div>body tab 3</div>
          </Tab>
        </Tabs>
    </Fragment>
);
}

export default ClientPersonal;
