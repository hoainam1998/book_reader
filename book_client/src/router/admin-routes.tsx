import { Navigate, Link, UIMatch, Outlet } from 'react-router-dom';
import AdminLogin from 'views/login-group/login/admin-login/admin-login';
import AdminResetPassword,
{ getResetPasswordToken }
from 'views/login-group/reset-password/admin-reset-password/admin-reset-password';
import Home from 'views/home/admin/home';
import AdminPersonal from 'views/personal/admin-personal/admin-personal';
import UserList, { loadInitUser } from 'views/user/user-list/user-list';
import UserDetail from 'views/user/user-detail/user-detail';
import Category, { loadInitCategory } from 'views/category/category';
import BookDetail, { loadAllCategory } from 'views/book-group/book-detail/book-detail';
import BookList, { bookPagination } from 'views/book-group/book-list/book-list';
import AuthorDetail, { loadAuthorDetail } from 'views/author-group/author-detail/author-detail';
import AuthorList, { authorPagination } from 'views/author-group/author-list/author-list';
import ApiError from 'components/error/api-error/api-error';
import VerifyOtp from 'views/login-group/verify-otp/verify-otp';
import ForgetPassword from 'views/login-group/forget-password/forget-password';
import LoginRequire from 'guard/login-require';
import AdminRequire from 'guard/admin-require';
import { NavigationRouteMatchType, RoutePropsUnion } from './interfaces';
import path from './paths';

const adminRoutes: RoutePropsUnion[] = [
  {
    path: path.ROOT,
    element: <Navigate replace to={path.LOGIN} />,
    errorElement: <ApiError alignCenter />,
  },
  {
    path: path.LOGIN,
    element: <LoginRequire><AdminLogin /></LoginRequire>
  },
  {
    path: path.FORGET_PASSWORD,
    element: <ForgetPassword />
  },
  {
    path: path.RESET_PASSWORD,
    element: <AdminResetPassword />,
    loader: getResetPasswordToken,
  },
  {
    path: path.OTP,
    element: <LoginRequire><VerifyOtp /></LoginRequire>
  },
  {
    path: path.PERSONAL,
    element: <LoginRequire><AdminPersonal /></LoginRequire>
  },
  {
    path: path.HOME,
    element: <LoginRequire><Home /></LoginRequire>,
    handle: {
      crumb: ({ pathname }: UIMatch) =>
        <Link key={pathname} to={pathname}>
          Home
        </Link>
    },
    children: [
      {
        index: true,
        element: <Navigate replace to={path.CATEGORY} />
      },
      {
        path: path.CATEGORY,
        name: 'categories',
        icon: 'application.png',
        element: <Category />,
        errorElement: <ApiError alignCenter />,
        handle: {
          crumb: (match: UIMatch) =>
            <span key={match.pathname}>Categories</span>
        },
        loader: loadInitCategory,
      },
      {
        path: path.USER,
        icon: 'user-group.png',
        name: 'users',
        element: <Outlet />,
        handle: {
          crumb: ({ pathname }: UIMatch) =>
            <Link key={pathname} to={pathname}>
              User
            </Link>
        },
        children: [
          {
            index: true,
            element: <UserList />,
            loader: loadInitUser,
            errorElement: <ApiError alignCenter />
          },
          {
            path: 'new',
            element: <AdminRequire><UserDetail /></AdminRequire>,
            errorElement: <ApiError alignCenter />,
            handle: {
              crumb: ({ pathname }: UIMatch) => <span key={pathname}>New</span>
            }
          },
          {
            path: path.ID,
            element: <AdminRequire><UserDetail /></AdminRequire>,
            errorElement: <ApiError alignCenter />,
            handle: {
              crumb: ({ pathname, name }: NavigationRouteMatchType) =>
                <span key={pathname}>{name}</span>
            }
          },
        ]
      },
      {
        path: path.BOOK,
        name: 'books',
        icon: 'book.png',
        element: <Outlet />,
        handle: {
          crumb: ({ pathname }: UIMatch) =>
            <Link key={pathname} to={pathname}>
              Book
            </Link>
        },
        children: [
          {
            index: true,
            element: <BookList />,
            loader: bookPagination,
            errorElement: <ApiError alignCenter />
          },
          {
            path: path.ID,
            element: <BookDetail />,
            errorElement: <ApiError alignCenter />,
            loader: loadAllCategory,
            handle: {
              crumb: ({ pathname, name }: NavigationRouteMatchType) =>
                <span key={pathname}>{name}</span>
            }
          },
          {
            path: path.NEW,
            element: <BookDetail />,
            errorElement: <ApiError alignCenter />,
            loader: loadAllCategory,
            handle: {
              crumb: ({ pathname }: UIMatch) =>
                <span key={pathname}>New</span>
            }
          }
        ]
      },
      {
        path: path.AUTHOR,
        name: 'authors',
        icon: 'writer.png',
        element: <Outlet />,
        handle: {
          crumb: ({ pathname }: UIMatch) =>
            <Link key={pathname} to={pathname}>
              Author
            </Link>
        },
        children: [
          {
            index: true,
            element: <AuthorList />,
            loader: authorPagination,
            errorElement: <ApiError alignCenter />
          },
          {
            path: path.NEW,
            element: <AuthorDetail />,
            errorElement: <ApiError alignCenter />,
            handle: {
              crumb: ({ pathname }: UIMatch) =>
                <span key={pathname}>New</span>
            }
          },
          {
            path: path.ID,
            element: <AuthorDetail />,
            loader: loadAuthorDetail,
            errorElement: <ApiError alignCenter />,
            handle: {
              crumb: ({ pathname, name }: NavigationRouteMatchType) =>
                <span key={pathname}>{name}</span>
            }
          },
        ]
      }
    ]
  }
];

export default adminRoutes;
