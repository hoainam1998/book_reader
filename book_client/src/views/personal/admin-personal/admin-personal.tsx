import { JSX } from 'react';
import Personal from '../personal';
import { updatePerson } from '../fetcher';
import { getAllUsers } from 'views/user/fetcher';

function AdminPerson(): JSX.Element {
  return <Personal update={updatePerson} getAllUsers={getAllUsers} />;
}

export default AdminPerson;
