import { useCallback, useReducer, useMemo } from 'react';
import Button from 'components/button/button';
import LinkedList, { Node } from './double-linked-list';
import { clsx } from 'utils';
import './style.scss';

type PaginationProps = {
  pageNumber: number;
};

type PageButton = {
  active: boolean;
  page: number;
  isSelected: boolean;
};

type DotPageButton = {
  dots: boolean;
};

type PaginationAction = {
  page?: Node<PageButton>;
};

let previousSelectedPage: Node<PageButton> | null = null;

const renderPagination = (pageActive: Node<PageButton>, pages: Node<PageButton>[]):
(Node<PageButton> | DotPageButton)[] => {
  if (previousSelectedPage) {
    previousSelectedPage.data.active = false;
  }
  pageActive.data.active = true;
  previousSelectedPage = pageActive;
  let array: any[] = [];
  // three first page, those must have
  const firstPages = pages.slice(0, 3);
  // two last page, must have
  const lastPages = pages.slice(-2, pages.length);
  // thereby two last page must to add and pages.length === amount of pages so lastPageAdded:
  const lastPageAdded = pages.length - 2;
  // number pages showed
  const numberPageShowed = 10;
  // because 1, 2, 3 must have, so when selected real page active will be 4
  const firstPageAdded = 4;
  // because last page and nearest last page already selected
  const nearestLastPage = lastPageAdded + 1;
  if (pageActive.data.page <= firstPageAdded - 1) {
    pageActive = pages[3];
  }

  // because last page and nearest last page already selected, so if user selected those page, real page active will come before them
  if (pageActive.data.page >= nearestLastPage) {
    pageActive = pages[lastPageAdded - 1];
  }

  // this function using to add previous page of current
  const addPrevious = (pageActive: any) => {
    // adding head of pagination list
    array.unshift(pageActive);

    // if have previous and previous near to the firsts page then continue adding, else will add dot button
    if (pageActive.previous && pageActive.data.page > firstPageAdded) {
      if (pageActive.data.page - 1 === firstPageAdded) {
        addPrevious(pageActive.previous);
      } else {
        array.unshift({ dots: true });
        return;
      }
    }
  };

  // this function using to add next page of current
  const addNext = (pageActive: any) => {
    array.push(pageActive);

    if (pageActive.data.page !== lastPageAdded) {
      if (pageActive.next && pageActive.next.data.page + 1 >= nearestLastPage) {
        addNext(pageActive.next);
      } else if (pageActive.next) {
        array.push({ dots: true });
        return;
      }
    }
  };

  // adding page selected
  if (pageActive.data.page > firstPageAdded - 1 && pageActive.data.page < nearestLastPage) {
    array.push(pageActive);
  }

  // add previous page
  if (pageActive.previous && pageActive.data.page > firstPageAdded) {
    addPrevious(pageActive.previous);
  }

  // adding next page
  if (pageActive.next && pageActive.data.page < lastPageAdded) {
    addNext(pageActive.next);
  }

  // if first page selected is dot, it's mean is still have amount page to page 4
  // else page was selected, only concat first pages

  if (array.length > 0 && array[0].dots) {
    // concat the last pages
    array = array.concat(lastPages);

    // if select enough 7 page, concat the first pages
    // else will be take the first pages, start at 4 index to pages missing
    // (pages missing = array.length - firstPages.length, plus with 1 to includes)
    if (array.length + firstPages.length === numberPageShowed) {
      array = firstPages.concat(array);
    } else {
      array = firstPages
        .concat(pages.slice(firstPages.length, (numberPageShowed - array.length)))
        .concat(array);
    }
  } else {
    array = firstPages.concat(array);
    array = array.concat(pages.slice(-(numberPageShowed - array.length), pages.length));
  }
  return array;
};

const paginationHandleReducer = (pages: Node<PageButton>[]) =>
  (_: (Node<PageButton> | DotPageButton)[], action: PaginationAction): (Node<PageButton> | DotPageButton)[] => {
    return renderPagination(action.page as Node<PageButton>, pages);
};

function Pagination({ pageNumber }: PaginationProps): JSX.Element {
  const pages = useMemo(() => {
    const paginationArray: PageButton[] = [];

    for (let i = 1; i <= 21; i++) {
      paginationArray.push({
        active: false,
        page: i,
        isSelected: i <= 3 || i >= 21 - 1,
      });
    }

    LinkedList.createdFromArray(paginationArray);
    return LinkedList.Nodes as Node<PageButton>[];
  }, [pageNumber]);

  const [pageList, dispatch] = useReducer(paginationHandleReducer(pages), renderPagination(pages[0], pages));

  const pageClick = useCallback((page: Node<PageButton> | DotPageButton) => {
    if (page && !(page as DotPageButton).dots
      && previousSelectedPage?.data.page !== (page as Node<PageButton>).data.page) {
        dispatch({ page: page as Node<PageButton> });
    }
  }, [pageList]);

  return (
    <ul className="pagination">
      <li>
        <Button className="pagination-button direction"
          onClick={() => pageClick(pages[0])}>
          &#11244;
        </Button>
      </li>
      <li>
        <Button className="pagination-button direction"
          onClick={() => pageClick(previousSelectedPage?.previous as Node<PageButton>)}>
          &#11164;
      </Button>
      </li>
      {
        pageList.map((page: any, index: number) => (
          <li key={index}>
            <Button className={clsx('pagination-button', { 'active': page.data?.active, 'dots': page.dots })} onClick={() => pageClick(page)}>
              {page.data?.page || '...'}
            </Button>
          </li>
        ))
      }
      <li>
        <Button className="pagination-button direction"
          onClick={() => pageClick(previousSelectedPage?.next as Node<PageButton>)}>
          &#11166;
        </Button>
      </li>
      <li>
        <Button className="pagination-button direction"
          onClick={() => pageClick(pages[pages.length - 1])}>
          &#11246;
        </Button>
      </li>
    </ul>
  );
}

export default Pagination;
