import { JSX, useCallback, useMemo } from 'react';
import { AxiosResponse } from 'axios';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import path from 'paths';
import { openFile } from 'utils';
import constants from 'read-only-variables';
import { authorPagination } from './fetcher';

type AuthorType = {
  authorId: string;
  name: string;
  avatar: string;
  sex: number;
  yearOfBirth: number;
  yearOfDead: number;
  storyFile: string;
};

const fields: Field[] = [
  {
    key: 'avatar'
  },
  {
    key: 'name'
  },
  {
    key: 'sex'
  },
  {
    key: 'yearOfBirth',
    label: 'Year of birth'
  },
  {
    key: 'yearOfDead',
    label: 'Year of dead'
  },
  {
    key: 'storyFile',
    label: 'Story'
  },
  {
    key: 'operation',
    width: 150,
    style: {
      color: 'transparent',
      userSelect: 'none'
    }
  }
];

let _keyword: string = '';
let _pageSize: number = 10;

function AuthorList(): JSX.Element {
  const fetcher = useFetcher();
  const loaderData = useLoaderData() as unknown;
  const navigate = useNavigate();

  const authors = useMemo<AuthorType[]>(() => {
    if (fetcher.data) {
      return fetcher.data.data.list;
    }
    return (loaderData as AxiosResponse).data.list || [];
  }, [fetcher.data]);

  const total = useMemo<number>(() => {
    if (fetcher.data) {
      return fetcher.data.data.total;
    }
    return (loaderData as AxiosResponse).data.total || 0;
  }, [fetcher.data]);

  const operationSlot = useCallback((slotProp: AuthorType): JSX.Element => {
    const { authorId } = slotProp;

    return (
      <div>
        <Button variant="success" onClick={() => navigate(authorId)}>
          Update
        </Button>
        &nbsp;&nbsp;
        <Button variant="dangerous" onClick={() => {}}>
          Delete
        </Button>
      </div>
    );
  }, []);

  const fetchAuthorPagination = (pageSize: number, pageNumber: number): void => {
    _pageSize = pageSize;
    fetcher.submit({ pageSize, pageNumber, keyword: _keyword });
  };

  const search = useCallback((keyword: string): void => {
    _keyword = keyword;
    fetchAuthorPagination(_pageSize, 1);
  }, []);

  return (
    <section className="author-list">
      <HeaderDashboard disabled={total === 0} add={() => navigate(path.NEW)} search={search} />
      <Table<AuthorType>
        key={_keyword}
        responsive
        fields={fields}
        data={authors}
        total={total}
        emptyMessage="Authors are not found!"
        onLoad={fetchAuthorPagination}>
          <Slot<AuthorType>
            name="avatar"
            render={(slotProp) => (
              <img height="50px" width="50px" src={slotProp.avatar} alt="author-avatar" />
            )}/>
          <Slot<AuthorType> name="sex" render={(slotProp) => constants.SEX[slotProp.sex] } />
          <Slot<AuthorType>
            name="storyFile"
            render={(slotProp) => (
              <Button variant="success" disabled={!slotProp.storyFile} onClick={() => openFile(slotProp.storyFile)}>
                Preview
              </Button>
            )}/>
          <Slot name="operation" render={operationSlot} />
      </Table>
    </section>
  );
}

export {
  authorPagination
};
export default AuthorList;
