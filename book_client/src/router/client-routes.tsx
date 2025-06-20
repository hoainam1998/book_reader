import { Navigate } from 'react-router-dom';
import ClientLogin from 'views/login-group/login/client-login/client-login';
import ForgetPassword from 'views/login-group/forget-password/forget-password';
import ResetPassword,
{ getResetPasswordToken }
from 'views/login-group/reset-password/client-reset-password/client-reset-password';
import GridOutlet from 'components/grid-outlet/grid-outlet';
import ApiError from 'components/error/api-error/api-error';
import Signup from 'views/login-group/signup/signup';
import Home from 'views/home/client/home';
import AllBooks from 'views/all-books/all-books';
import { ClientBookDetail, ClientAuthorDetail } from 'views/client-detail/client-detail';
import ClientPersonal from 'views/personal/client-personal/client-personal';
import LoginRequire from 'guard/login-require';
import { RoutePropsUnion } from './interfaces';
import path from './paths';

const clientRoutes: RoutePropsUnion[] = [
  {
    path: path.ROOT,
    element: <Navigate replace to={path.LOGIN} />,
    errorElement: <ApiError alignCenter />,
  },
  {
    path: path.LOGIN,
    element: <LoginRequire><ClientLogin /></LoginRequire>,
  },
  {
    path: path.FORGET_PASSWORD,
    element: <LoginRequire><ForgetPassword /></LoginRequire>,
  },
  {
    path: path.RESET_PASSWORD,
    element: <LoginRequire><ResetPassword /></LoginRequire>,
    loader: getResetPasswordToken,
  },
  {
    path: path.SIGN_UP,
    element: <LoginRequire><Signup /></LoginRequire>,
  },
  {
    path: path.HOME,
    element: <Home />,
    children: [
      {
        index: true,
        element: <Navigate replace to={path.ALL} />
      },
      {
        path: path.ALL,
        name: 'categories',
        icon: 'select-all.png',
        element: <GridOutlet />,
        errorElement: <ApiError alignCenter />,
        children: [
          {
            index: true,
            element: <AllBooks />,
          }
        ]
      },
      {
        path: path.CATEGORIES,
        name: 'categories',
        icon: 'select-all.png',
        element: <GridOutlet />,
        errorElement: <ApiError alignCenter />,
        children: [
          {
            path: path.ID,
            element: <AllBooks />,
          }
        ]
      },
      {
        path: path.AUTHORS,
        name: 'categories',
        icon: 'select-all.png',
        element: <GridOutlet />,
        errorElement: <ApiError alignCenter />,
        children: [
          {
            path: path.ID,
            element: <AllBooks />,
          }
        ]
      },
      {
        path: `${path.BOOK}/${path.ID}`,
        element: <ClientBookDetail />,
        errorElement: <ApiError alignCenter />,
      },
      {
        path: `${path.AUTHOR}/${path.ID}`,
        element: <ClientAuthorDetail />,
        errorElement: <ApiError alignCenter />,
      },
      {
        path: 'personal',
        element: <ClientPersonal />,
        errorElement: <ApiError alignCenter />,
      },
    ]
  },
];

export default clientRoutes;
