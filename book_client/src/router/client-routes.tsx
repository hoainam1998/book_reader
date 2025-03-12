import { Navigate } from 'react-router-dom';
import ClientLogin from 'views/login-group/login/client-login/client-login';
import ForgetPassword from 'views/login-group/forget-password/forget-password';
import ResetPassword from 'views/login-group/reset-password/reset-password';
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
  {
    path: path.FORGET_PASSWORD,
    element: <ForgetPassword />
  },
  {
    path: path.RESET_PASSWORD,
    element: <ResetPassword />
  }
];

export default clientRoutes;
