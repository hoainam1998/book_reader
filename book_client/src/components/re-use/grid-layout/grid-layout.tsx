/* eslint-disable no-unused-vars */
import { JSX, ReactElement, useState } from 'react';
import Pagination from 'components/pagination/pagination';
import { clsx } from 'utils';
import './style.scss';

enum COL_NAME {
  FOUR = 'four',
  FIVE = 'five',
};

type GridLayoutPropsType = {
  children: ReactElement;
};

function GridLayout({ children }: GridLayoutPropsType): JSX.Element {
  const [cols, setCols] = useState<string>(COL_NAME.FOUR);

  return (
    <section className="grid-layout-wrapper">
      <div className="top-operation">
        <div className="result-info">
          <span>Result for:</span>
          &nbsp;
          <span>category</span>
        </div>
        <div className="grid-layout-btn-group">
          <button onClick={() => setCols(COL_NAME.FOUR)}>
            <img src={require('images/grid-three-col.png')} />
          </button>
          <button onClick={() => setCols(COL_NAME.FIVE)}>
            <img src={require('images/grid-four-col.png')} />
          </button>
        </div>
      </div>
      <div className="grid-content">
        <div className={clsx(`grid-layout ${cols}-column`)}>
          {children}
        </div>
        <div className="grid-pagination">
          <Pagination horizontal pageNumber={12} onChange={() => {}} />
        </div>
      </div>
    </section>
  );
}

export default GridLayout;
