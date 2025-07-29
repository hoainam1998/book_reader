import { JSX, useCallback, useMemo } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import Table from 'components/table/table';
import Button from 'components/button/button';
import type { Field } from 'components/table/table';
import Slot from 'components/slot/slot';
import Switch from 'components/form/form-control/switch/switch';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import Tooltip from 'components/tooltip/tooltip';
import useFetchDataTable from 'hooks/useFetchDataTable';
import constants from 'read-only-variables';
import { showToast } from 'utils';
import auth from 'store/auth';
import path from 'router/paths';
import { Role } from 'enums';
import { loadInitUser, updateMfaState, updatePower, deleteUser as _deleteUser } from '../fetcher';
import './style.scss';

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
  const { fetcherData, fetch, pageSelected } = useFetchDataTable();
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const responseData = fetcherData || loaderData;

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

    if (auth.Role === Role.ADMIN) {
      adminFields.splice(1, 1);
    }

    return defaultFields.concat(adminFields);
  }
  return defaultFields;
  }, [auth.IsAdmin]);

  const updateMfa = useCallback((userId: string, mfaEnable: boolean): void => {
    updateMfaState(userId, mfaEnable)
      .then((response) => {
        showToast('Update mfa!', response.data.message);
        fetch();
      })
      .catch((error) => showToast('Update mfa!', error.response.data.message));
  }, []);

    const updatePermission = useCallback((userId: string, power: boolean): void => {
    updatePower(userId, power)
      .then((response) => {
        showToast('Update permission!', response.data.message);
        fetch();
      })
      .catch((error) => showToast('Update permission!', error.response.data.message));
  }, []);

  const navigateToDetailPage = useCallback((): void => {
    navigate(path.NEW);
  }, []);

  const search = useCallback((keyword: string): void => {
    fetch({ pageNumber: 1, keyword });
  }, [fetch]);

  const operationSlot = useCallback((slotProp: UserType): JSX.Element => {
    const { userId } = slotProp;

    const getUserDetail = useCallback((): void => {
      navigate(userId);
    }, [userId]);

    const deleteUser = useCallback((): void => {
      _deleteUser(userId).
        then((res) => {
          fetch({ pageNumber: 1 });
          showToast('Delete user!', res.data.message);
        })
        .catch((error) => showToast('Delete user!', error.response.data.message));
    }, [userId]);

    if (userId) {
      return (
        <div>
          <Button variant="success" onClick={getUserDetail}>Update</Button>
            &nbsp;&nbsp;
          <Button variant="dangerous" onClick={deleteUser}>Delete</Button>
        </div>
      );
    }
    return <></>;
  }, []);

  const checkYouHavePermissionToUpdatePower = useCallback((userId: string): boolean => {
    let havePermission = false;
    if (auth.Role === Role.SUPER_ADMIN) {
      if (userId) {
        if (auth.UserId !== userId) {
          havePermission = true;
        }
      }
    }
    return havePermission;
  }, [auth.UserId]);

  return (
    <>
      <HeaderDashboard hiddenNewBtn={!auth.IsAdmin} add={navigateToDetailPage} search={search} />
      <Table
        responsive
        fields={fields}
        data={users}
        total={total}
        pageSelected={pageSelected}
        emptyMessage="Users are not found!"
        onLoad={fetch}>
          <Slot<UserType> name="avatar" render={
            (slotProp) => <img
              height="50px"
              width="50px"
              src={slotProp.avatar || require('images/employee.png')}
              alt="category-avatar"/>
            } />
          <Slot<UserType> name="email" render={
            (slotProp) => <Tooltip className="email-col"><div className="line-clamp">{slotProp.email}</div></Tooltip>
            } />
          <Slot<UserType> name="sex" render={({ sex }) => constants.SEX[sex] } />
          <Slot<UserType> name="mfaEnable" render={
            (slotProp) => (slotProp.mfaEnable !== null ? <Switch label="" name="mfa"
              value={slotProp.mfaEnable} onChange={(mfaEnable) => updateMfa(slotProp.userId, mfaEnable)} />
              : <></>
            )
            } />
          <Slot<UserType> name="isAdmin" render={
            (slotProp) => (checkYouHavePermissionToUpdatePower(slotProp.userId)
              ? <Switch
                  label=""
                  name="admin"
                  checkValue={1}
                  notCheckValue={0}
                  value={slotProp.isAdmin}
                  onChange={(power) => updatePermission(slotProp.userId, power)} />
              : <></>
            )
          } />
          <Slot name="operation" render={operationSlot} />
      </Table>
    </>
  );
}

export { loadInitUser };
export default UserList;
