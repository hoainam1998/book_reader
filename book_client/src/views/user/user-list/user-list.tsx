import { JSX, useCallback } from 'react';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import Button from 'components/button/button';
import type { Field } from 'components/table/table';
import Slot from 'components/slot/slot';
import Switch from 'components/form/form-control/switch/switch';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Tooltip from 'components/tooltip/tooltip';
import { showToast } from 'utils';
import { loadInitUser, updateMfaState, deleteUser as _deleteUser } from '../fetcher';
import './style.scss';

let _keyword: string = '';
let _pageSize: number = 10;
let _pageNumber: number = 1;

type UserType = {
  userId: string;
  avatar: string;
  name: string;
  email: string;
  mfaEnable: boolean;
};

function UserList(): JSX.Element {
  const fetcher = useFetcher();
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const responseData = fetcher.data || loaderData;

  const users: UserType[] = responseData.data?.list || [];
  const total: number = responseData.data?.total || 0;

  const fields: Field[] = [
    {
      key: 'avatar'
    },
    {
      key: 'name'
    },
    {
      key: 'email'
    },
    {
      key: 'mfaEnable',
      label: 'MFA'
    },
    {
      key: 'operation',
      width: 150,
      style: {
        color: 'transparent',
        userSelect: 'none',
      }
    }
  ];

  const fetchUser = useCallback((pageSize: number, pageNumber: number): void => {
    _pageSize = pageSize;
    _pageNumber = pageNumber;
    fetcher.submit({ pageSize, pageNumber, keyword: _keyword });
  }, []);

  const updateMfa = useCallback((userId: string, mfaEnable: boolean): void => {
    updateMfaState(userId, mfaEnable)
      .then(() => fetchUser(_pageSize, _pageNumber));
  }, []);

  const navigateToDetailPage = useCallback((): void => {
    navigate('new');
  }, []);

  const search = useCallback((keyword: string): void => {
    _keyword = keyword;
    fetchUser(_pageSize, 1);
  }, []);

  const operationSlot = useCallback((slotProp: UserType): JSX.Element => {
    const { userId } = slotProp;

    const getUserDetail = useCallback((): void => {
      navigate(userId);
    }, [userId]);

    const deleteUser = useCallback((): void => {
      _deleteUser(userId).
        then(() => fetchUser(_pageSize, 1))
        .catch((res) => showToast('User', res.response.data.message));
    }, [userId]);

    return (
      <div>
        <Button variant="success" onClick={getUserDetail}>Update</Button>
          &nbsp;&nbsp;
        <Button variant="dangerous" onClick={deleteUser}>Delete</Button>
      </div>
    );
  }, []);

  return (
    <>
      <HeaderDashboard add={navigateToDetailPage} search={search} />
      <Table
        responsive
        fields={fields}
        data={users}
        total={total}
        emptyMessage="Users are not found!"
        onLoad={fetchUser}>
          <Slot<UserType> name="avatar" render={
            (slotProp) => <img height="50px" width="50px" src={slotProp.avatar} alt="category-avatar"/>
            } />
          <Slot<UserType> name="email" render={
            (slotProp) => <Tooltip className="email-col"><div className="line-clamp">{slotProp.email}</div></Tooltip>
            } />
          <Slot<UserType> name="mfaEnable" render={
            (slotProp) => <Switch label="" name="mfa"
              value={slotProp.mfaEnable} onChange={(mfaEnable) => updateMfa(slotProp.userId, mfaEnable)} />
            } />
          <Slot name="operation" render={operationSlot} />
      </Table>
    </>
  );
}

export { loadInitUser };
export default UserList;
