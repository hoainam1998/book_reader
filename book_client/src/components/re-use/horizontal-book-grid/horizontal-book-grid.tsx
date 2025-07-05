import { JSX } from 'react';
import HorizontalBook from 'components/re-use/horizontal-book/horizontal-book';
import List from 'components/list/list';
import { HorizontalBookType } from 'interfaces';
import './style.scss';

type HorizontalBookGridPropsType = {
  items: HorizontalBookType[];
};

function HorizontalBookGrid({ items }: HorizontalBookGridPropsType): JSX.Element {
  return (
    <div className="horizontal-book-grid">
      <List<HorizontalBookType> items={items} render={(item) => <HorizontalBook {...item} />} />
    </div>
  );
}

export default HorizontalBookGrid;
