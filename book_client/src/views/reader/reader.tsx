import { JSX, useCallback, useMemo } from 'react';
import { AxiosResponse } from 'axios';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import path from 'router/paths';
import constants from 'read-only-variables';
import { clientPagination, blockClient } from './fetcher';
import { showToast } from 'utils';

type ClientType = {
  clientId: string;
  name: string;
  avatar: string;
  sex: number;
  email: string;
  blocked: number;
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
    key: 'email'
  },
  {
    key: 'phone'
  },
  {
    key: 'blocked'
  },
  {
    key: 'operation',
    width: 100,
    style: {
      color: 'transparent',
      userSelect: 'none',
    }
  }
];

let _keyword: string = '';
let _pageSize: number = 10;

function AuthorList(): JSX.Element {
  const fetcher = useFetcher();
  const loaderData = useLoaderData() as unknown;
  const navigate = useNavigate();

  const clients = useMemo<ClientType[]>(() => {
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

  const fetchAuthorPagination = (pageSize: number, pageNumber: number): void => {
    _pageSize = pageSize;
    fetcher.submit({ pageSize, pageNumber, keyword: _keyword });
  };

  const search = useCallback((keyword: string): void => {
    _keyword = keyword;
    fetchAuthorPagination(_pageSize, 1);
  }, []);

  const operationSlot = useCallback((slotProp: ClientType): JSX.Element => {
    const { clientId } = slotProp;

    const block = (): void => {
      blockClient(clientId)
        .then((res) => {
          showToast('Block client!', res.data.message);
          fetchAuthorPagination(_pageSize, 1);
        })
        .catch((error) => {
          showToast('Block client!', error.response.data.message);
        });
    };

    return (<Button variant="dangerous" onClick={block}>Block</Button>);
  }, []);

  return (
    <section className="client-list">
      <HeaderDashboard disabled={total === 0} hiddenNewBtn={true} add={() => navigate(path.NEW)} search={search} />
      <Table<ClientType>
        key={_keyword}
        responsive
        fields={fields}
        data={clients}
        total={total}
        emptyMessage="Clients are not found!"
        onLoad={fetchAuthorPagination}>
          <Slot<ClientType>
            name="avatar"
            render={(slotProp) => (
              <img
                height="50px"
                width="50px"
                src={slotProp.avatar || require('images/reader.png')}
                alt="client-avatar" />
            )}/>
          <Slot<ClientType> name="sex" render={(slotProp) => constants.SEX[slotProp.sex] } />
          <Slot<ClientType> name="blocked" render={(slotProp) => constants.BLOCK[slotProp.blocked] } />
          <Slot name="operation" render={operationSlot} />
      </Table>
    </section>
  );
}

export { clientPagination };
export default AuthorList;
