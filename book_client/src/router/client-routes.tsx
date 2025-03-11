import { Navigate } from 'react-router-dom';
import ClientLogin from 'views/login-group/login/client-login/client-login';
import { RoutePropsUnion } from './interfaces';
import path from './paths';

const clientRoutes: RoutePropsUnion[] = [
  {
    path: path.ROOT,
    element: <Navigate replace to={path.LOGIN} />
  },
  {
    path: path.LOGIN,
    element: <ClientLogin />
  },
];

export default clientRoutes;
