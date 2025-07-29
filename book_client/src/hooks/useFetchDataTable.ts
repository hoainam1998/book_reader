import { useState, useCallback, useEffect } from 'react';
import { FetcherWithComponents, useFetcher } from 'react-router-dom';

export type FetchParamType = {
  pageSize?: number;
  pageNumber?: number;
  keyword?: string;
};

type FetcherDataTableReturnType = {
  pageSelected: number;
  fetcher: FetcherWithComponents<any>;
  fetcherData: any;
  fetch: (...fetchParams: any | undefined) => void;
};

let _keyword: string;
let _pageSize: number = 10;
let _pageNumber: number = 1;

/**
 * Fetcher data table with pagination param.
 *
 * @return {FetcherDataTableReturnType}
 */
export default (): FetcherDataTableReturnType => {
  const fetcher = useFetcher();
  const [pageSelected, setPageSelected] = useState<number>(1);

  useEffect(() => {
    return () => {
      _pageSize = 10;
      _pageNumber = 1;
      _keyword = '';
    };
  }, []);

  return {
    pageSelected,
    fetcher,
    fetcherData: fetcher.data,
    fetch: useCallback(
      (...fetchParams): void => {
        let fetchParam: FetchParamType;
        if (fetchParams && fetchParams.length) {
          if (fetchParams[0] instanceof Object) {
            fetchParam = fetchParams[0];
          } else {
            fetchParam = {
              pageSize: fetchParams[0],
              pageNumber: fetchParams[1],
              keyword: fetchParams[2]
            };
          }

          const { pageNumber, pageSize, keyword } = fetchParam;

          if (pageSize) {
            _pageSize = pageSize;
          } else {
            fetchParam.pageSize = _pageSize;
          }

          if (pageNumber) {
            _pageNumber = pageNumber;
            setPageSelected(pageNumber);
          } else {
            fetchParam.pageNumber = _pageNumber;
          }

          if (keyword !== undefined) {
            _keyword = keyword;
          } else if (_keyword) {
            fetchParam.keyword = _keyword;
          } else {
            delete fetchParam.keyword;
          }

          fetcher.submit(fetchParam);
        } else {
          let cacheFetchParam: FetchParamType = {
            pageSize: _pageSize,
            pageNumber: _pageNumber
          };

          if (_keyword) {
            cacheFetchParam = { ...cacheFetchParam, keyword: _keyword };
          }

          fetcher.submit(cacheFetchParam);
        }
      },
      [fetcher]
    )
  };
};
