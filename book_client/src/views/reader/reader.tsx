import { JSX, useCallback } from 'react';
import { useLoaderData } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import useFetchDataTable from 'hooks/useFetchDataTable';
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
    },
  },
];

function AuthorList(): JSX.Element {
  const { fetcherData, fetch, pageSelected } = useFetchDataTable();
  const loaderData = useLoaderData() as unknown;

  const clients: ClientType[] = (fetcherData || loaderData).data.list;
  const total: number = (fetcherData || loaderData).data.total;

  const search = useCallback((keyword: string): void => {
    fetch({ pageNumber: 1, keyword });
  }, [fetch]);

  const operationSlot = useCallback((slotProp: ClientType): JSX.Element => {
    const { clientId } = slotProp;

    const block = (): void => {
      blockClient(clientId)
        .then((res) => {
          showToast('Block client!', res.data.message);
          fetch({ pageNumber: 1 });
        })
        .catch((error) => {
          showToast('Block client!', error.response.data.message);
        });
    };

    return (<Button variant="dangerous" onClick={block}>Block</Button>);
  }, []);

  return (
    <section className="client-list">
      <HeaderDashboard disabled={total === 0} hiddenNewBtn={true} search={search} />
      <Table<ClientType>
        responsive
        fields={fields}
        data={clients}
        total={total}
        pageSelected={pageSelected}
        emptyMessage="Clients are not found!"
        onLoad={fetch}>
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
