import { JSX, useCallback } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import type { Field } from 'components/table/table';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Slot from 'components/slot/slot';
import Button from 'components/button/button';
import useFetchDataTable from 'hooks/useFetchDataTable';
import path from 'router/paths';
import { openFile, showToast } from 'utils';
import constants from 'read-only-variables';
import { authorPagination, deleteAuthor } from '../fetcher';

type AuthorType = {
  authorId: string;
  name: string;
  avatar: string;
  sex: number;
  yearOfBirth: number;
  yearOfDead: number;
  storyFile: string;
  disabled: boolean;
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

function AuthorList(): JSX.Element {
  const { fetcherData, fetch, pageSelected } = useFetchDataTable();
  const loaderData = useLoaderData() as unknown;
  const navigate = useNavigate();

  const authors: AuthorType[] = (fetcherData || loaderData).data.list;
  const total: number = (fetcherData || loaderData).data.total;

  const search = useCallback((keyword: string): void => {
    fetch({ pageNumber: 1, keyword });
  }, [fetch]);

  const operationSlot = useCallback((slotProp: AuthorType): JSX.Element => {
    const { authorId, disabled } = slotProp;

    const deleteAuthorClick = useCallback(() => {
      deleteAuthor(authorId)
        .then((response) => {
          showToast('Delete author!', response.data.message);
          fetch({ pageNumber: 1 });
        })
        .catch((error) => showToast('Delete author!', error.response.data.message));
    }, [authorId]);

    return (
      <div>
        <Button variant="success" onClick={() => navigate(authorId)}>
          Update
        </Button>
        &nbsp;&nbsp;
        <Button variant="dangerous" disabled={disabled} onClick={deleteAuthorClick}>
          Delete
        </Button>
      </div>
    );
  }, []);

  return (
    <section className="author-list">
      <HeaderDashboard disabled={total === 0} add={() => navigate(path.NEW)} search={search} />
      <Table<AuthorType>
        responsive
        fields={fields}
        data={authors}
        total={total}
        pageSelected={pageSelected}
        emptyMessage="Authors are not found!"
        onLoad={fetch}>
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

export { authorPagination };
export default AuthorList;
