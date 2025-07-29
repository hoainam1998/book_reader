import {
  useCallback,
  useMemo,
  useEffect,
  JSX,
} from 'react';
import Button from 'components/button/button';
import LinkedList, { Node } from './double-linked-list';
import { clsx } from 'utils';
import './style.scss';

type PaginationProps = {
  pageSelected: number;
  pageNumber: number;
  onChange: (page: number) => void;
  horizontal?: boolean;
};

type PageButton = {
  active: boolean;
  page: number;
};

type DotPageButton = {
  dots: boolean;
};

let previousSelectedPage: Node<PageButton> | null = null;

const renderPagination = (pageActive: Node<PageButton>, pages: Node<PageButton>[]):
(Node<PageButton> | DotPageButton)[] => {
  // number pages showed
  const numberPageShowed = 10;

  if (previousSelectedPage && previousSelectedPage.data.page <= pages.length) {
    previousSelectedPage.data.active = false;
  }

  if (pageActive && pageActive.data) {
    pageActive.data.active = true;
  }

  previousSelectedPage = pageActive;

  if (pages.length > numberPageShowed) {
    let array: any[] = [];
    // three first page, those must have
    const firstPages = pages.slice(0, 3);
    // two last page, must have
    const lastPages = pages.slice(-2, pages.length);
    // thereby two last page must to add and pages.length === amount of pages so lastPageAdded:
    const lastPageAdded = pages.length - 2;
    // because 1, 2, 3 must have, so when selected real page active will be 4
    const firstPageAdded = 4;
    // because last page and nearest last page already selected
    const nearestLastPage = lastPageAdded + 1;
    if (pageActive.data.page <= firstPageAdded - 1) {
      pageActive = pages[3];
    }

    // because last page and nearest last page already selected,
    // so if user selected those page, real page active will come before them
    if (pageActive.data.page >= nearestLastPage) {
      pageActive = pages[lastPageAdded - 1];
    }

    // this function using to add previous page of current
    const addPrevious = (pageActive: any): void => {
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
    const addNext = (pageActive: any): void => {
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
    if (pageActive.data.page > firstPageAdded - 1
      && pageActive.data.page < nearestLastPage) {
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
  } else {
    return pages;
  }
};

function Pagination({ pageSelected, pageNumber, onChange, horizontal }: PaginationProps): JSX.Element {
  if (pageSelected <= 0) {
    console.warn('[Pagination] pageSelected must great than or equal 1');
    return <></>;
  } else if (pageSelected > pageNumber) {
    console.warn('[Pagination] pageSelected must less than pageNumber');
    return <></>;
  }

  const pages = useMemo<Node<PageButton>[]>(() => {
    const paginationArray: PageButton[] = [];

    for (let i = 1; i <= pageNumber; i++) {
      paginationArray.push({
        active: false,
        page: i,
      });
    }

    if (paginationArray.length) {
      LinkedList.createdFromArray(paginationArray);
      return LinkedList.Nodes as Node<PageButton>[];
    }
    return [];
  }, [pageNumber]);

  const indexSelectedPage = useMemo<number>(() => pageSelected === 1 ? 0 : pageSelected - 1, [pages, pageSelected]);

  const initPage = useMemo<Node<PageButton>>(() => pages[indexSelectedPage], [pages, indexSelectedPage]);

  const pageList = useMemo<(Node<PageButton> | DotPageButton)[]>
    (() => pages.length ? renderPagination(initPage, pages) : [], [initPage, pageNumber]);

  const { disablePrevious, disableNext } = useMemo<{ disablePrevious: boolean; disableNext: boolean }>(() => ({
    disablePrevious: previousSelectedPage!.data.page === pages[0].data.page,
    disableNext: previousSelectedPage!.data.page === pages[pages.length - 1].data.page,
  }), [previousSelectedPage]);

  const pageClick = useCallback((page: Node<PageButton> | DotPageButton): void => {
    if (page && !(page as DotPageButton).dots
      && previousSelectedPage?.data.page !== (page as Node<PageButton>).data.page) {
        onChange((page as Node<PageButton>).data.page);
    }
  }, [pageList]);

  useEffect(() => {
    if (pageList.length > 0 && (pageList[0] as Node<PageButton>)?.data) {
      (pageList[0] as Node<PageButton>).data.active = true;
      previousSelectedPage = (pageList[0] as Node<PageButton>);
    }
  }, [pageNumber]);

  if (pageList.length) {
    return (
      <ul className={clsx('pagination', horizontal && 'horizontal-pagination')}>
        <li>
          <Button className="pagination-button direction"
            disabled={disablePrevious}
            onClick={() => pageClick(pages[0])}>
            &#11244;
          </Button>
        </li>
        <li>
          <Button className="pagination-button direction"
            disabled={disablePrevious}
            onClick={() => pageClick(previousSelectedPage?.previous as Node<PageButton>)}>
            &#11164;
        </Button>
        </li>
        {
          pageList.map((page: any, index: number) => (
            <li key={index} data-testid={`pagination-button-${index + 1}`}>
              <Button
                className={clsx('pagination-button', { 'active': page.data?.active, 'dots': page.dots })}
                onClick={() => pageClick(page)}>
                  { page.data?.page || '...' }
              </Button>
            </li>
          ))
        }
        <li>
          <Button className="pagination-button direction"
            disabled={disableNext}
            onClick={() => pageClick(previousSelectedPage?.next as Node<PageButton>)}>
            &#11166;
          </Button>
        </li>
        <li>
          <Button className="pagination-button direction"
            disabled={disableNext}
            onClick={() => pageClick(pages[pages.length - 1])}>
            &#11246;
          </Button>
        </li>
      </ul>
    );
  }
  return (<></>);
}

export default Pagination;
