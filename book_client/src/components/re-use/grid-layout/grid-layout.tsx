/* eslint-disable no-unused-vars */
import { JSX, ReactElement, useCallback, useState } from 'react';
import Pagination from 'components/pagination/pagination';
import { useClientPaginationContext } from 'contexts/client-pagination';
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
  const { page, pages, onPageChange, condition, resultFor } = useClientPaginationContext();

  const onPageChangeWithCondition = useCallback((pageNumber: number): void => {
    if (onPageChange) {
      onPageChange(pageNumber, condition);
    }
  }, [condition, onPageChange]);

  return (
    <section className="grid-layout-wrapper">
      <div className="top-operation">
        <div className="result-info">
          <span>Result for:</span>
          &nbsp;
          <span>{resultFor}</span>
        </div>
        <div className="grid-layout-btn-group">
          <span className="page-nav">Page: &nbsp; {page}/{pages}</span>
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
          <Pagination horizontal pageNumber={pages} pageSelected={page} onChange={onPageChangeWithCondition} />
        </div>
      </div>
    </section>
  );
}

export default GridLayout;
