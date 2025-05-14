import { JSX, useCallback, useMemo } from 'react';
import { useFetcher, useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import Button from 'components/button/button';
import type { Field } from 'components/table/table';
import Slot from 'components/slot/slot';
import Switch from 'components/form/form-control/switch/switch';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Tooltip from 'components/tooltip/tooltip';
import constants from 'read-only-variables';
import { showToast } from 'utils';
import auth from 'store/auth';
import { loadInitUser, updateMfaState, updatePower, deleteUser as _deleteUser } from '../fetcher';
import './style.scss';

let _keyword: string = '';
let _pageSize: number = 10;
let _pageNumber: number = 1;

type UserType = {
  userId: string;
  avatar: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  sex: number;
  mfaEnable: boolean;
};

function UserList(): JSX.Element {
  const fetcher = useFetcher();
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const responseData = fetcher.data || loaderData;

  const users: UserType[] = responseData.data?.list || [];
  const total: number = responseData.data?.total || 0;

  const fields: Field[] = useMemo<Field[]>(() => {
    const defaultFields: Field[] = [
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
      key: 'phone'
    },
    {
      key: 'sex'
    },
    {
      key: 'role'
    },
  ];
  if (auth.IsAdmin) {
    const adminFields: Field[] = [
      {
        key: 'mfaEnable',
        label: 'MFA',
      },
      {
        key: 'isAdmin',
        label: 'Admin',
      },
      {
        key: 'operation',
        width: 200,
        style: {
          color: 'transparent',
          userSelect: 'none',
        }
      },
    ];
    return defaultFields.concat(adminFields);
  }
  return defaultFields;
  }, [auth.IsAdmin]);

  const fetchUser = useCallback((pageSize: number, pageNumber: number): void => {
    _pageSize = pageSize;
    _pageNumber = pageNumber;
    fetcher.submit({ pageSize, pageNumber, keyword: _keyword });
  }, []);

  const updateMfa = useCallback((userId: string, mfaEnable: boolean): void => {
    updateMfaState(userId, mfaEnable)
      .then((response) => {
        showToast('Update mfa!', response.data.message);
        fetchUser(_pageSize, _pageNumber);
      })
      .catch((error) => showToast('Update mfa!', error.response.data.message));
  }, []);

    const updatePermission = useCallback((userId: string, power: boolean): void => {
    updatePower(userId, power)
      .then((response) => {
        showToast('Update permission!', response.data.message);
        fetchUser(_pageSize, _pageNumber);
      })
      .catch((error) => showToast('Update permission!', error.response.data.message));
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
      <HeaderDashboard hiddenNewBtn={!auth.IsAdmin} add={navigateToDetailPage} search={search} />
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
          <Slot<UserType> name="sex" render={({ sex }) => constants.SEX[sex] } />
          <Slot<UserType> name="mfaEnable" render={
            (slotProp) => <Switch label="" name="mfa"
              value={slotProp.mfaEnable} onChange={(mfaEnable) => updateMfa(slotProp.userId, mfaEnable)} />
            } />
          <Slot<UserType> name="isAdmin" render={
            (slotProp) => <Switch label="" name="admin"
              value={slotProp.isAdmin} onChange={(power) => updatePermission(slotProp.userId, power)} />
            } />
          <Slot name="operation" render={operationSlot} />
      </Table>
    </>
  );
}

export { loadInitUser };
export default UserList;
