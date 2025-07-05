import { JSX, useSyncExternalStore } from 'react';
import Personal from '../personal';
import { updatePerson } from '../fetcher';
import { getAllUsers } from 'views/user/fetcher';
import store from 'store/auth';
import { PersonalType } from 'interfaces';
const { subscribe, getSnapshot } = store;

function AdminPerson(): JSX.Element {
  const userLogin = useSyncExternalStore(subscribe, getSnapshot) as PersonalType;
  return <Personal personal={userLogin} update={updatePerson} getAllUsers={getAllUsers} />;
}

export default AdminPerson;
