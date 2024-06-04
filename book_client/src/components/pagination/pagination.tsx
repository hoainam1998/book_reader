import { useCallback } from 'react';
import LinkedList, { Node } from './double-linked-list';
import './style.scss';

type PageButton = {
  active: boolean;
  dots: boolean;
  page: number;
};

function Pagination(): JSX.Element {
  const paginationArray: PageButton[] = [];

  for (let i = 1; i <= 21; i++) {
    paginationArray.push({
      active: false,
      dots: false,
      page: i
    });
  }

  LinkedList.createdFromArray(paginationArray);
  const pages = LinkedList.Nodes as Node<PageButton>[];

  const pageClick = useCallback(() => {
    console.log('click');
  }, [paginationArray]);

  return (
    <ul className="pagination">
      <li>
        <button className="pagination-button direction">&#11244;</button>
      </li>
      <li>
        <button className="pagination-button direction active">&#11164;</button>
      </li>
      {
        pages.map((page, index) =>
          <li key={index}>
            <button onClick={pageClick} className="pagination-button">{page.data.page}</button>
          </li>
        )
      }
      <li>
        <button className="pagination-button direction">&#11166;</button>
      </li>
      <li>
        <button className="pagination-button direction">&#11246;</button>
      </li>
    </ul>
  );
}

export default Pagination;
