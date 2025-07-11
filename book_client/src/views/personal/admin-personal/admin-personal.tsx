import { JSX, useSyncExternalStore } from 'react';
import Personal from '../personal';
import { updatePerson } from '../fetcher';
import { getAllUsers } from 'views/user/fetcher';
import { logout } from 'views/login-group/login/admin-login/fetcher';
import store from 'store/auth';
import { PersonalType } from 'interfaces';
const { subscribe, getSnapshot } = store;

function AdminPerson(): JSX.Element {
  const userLogin = useSyncExternalStore(subscribe, getSnapshot);
  const user = Object.assign(userLogin || {}, { id: userLogin?.userId }) as PersonalType;
  return <Personal personal={user} update={updatePerson} getAllUsers={getAllUsers} logout={logout} />;
}

export default AdminPerson;
