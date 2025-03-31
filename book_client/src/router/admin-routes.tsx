import { Navigate, Link, UIMatch, Outlet } from 'react-router-dom';
import AdminLogin from 'views/login-group/login/admin-login/admin-login';
import Home from 'views/home/home';
import Personal from 'views/personal/personal';
import UserList, { loadInitUser } from 'views/user/user-list/user-list';
import UserDetail, { loadUserDetail } from 'views/user/user-detail/user-detail';
import Category, { loadInitCategory } from 'views/category/category';
import BookDetail, { loadAllCategory } from 'views/book-group/book-detail/book-detail';
import BookList, { bookPagination } from 'views/book-group/book-list/book-list';
import AuthorDetail, { loadAuthorDetail } from 'views/author-group/author-detail/author-detail';
import AuthorList, { authorPagination } from 'views/author-group/author-list/author-list';
import ApiError from 'components/error/api-error/api-error';
import VerifyOtp from 'views/login-group/verify-otp/verify-otp';
import { LoginRequire, Logged  } from '../guard';
import { NavigationRouteMatchType, RoutePropsUnion } from './interfaces';
import path from './paths';

const adminRoutes: RoutePropsUnion[] = [
  {
    path: path.ROOT,
    element: <Navigate replace to={path.LOGIN} />
  },
  {
    path: path.LOGIN,
    element: <Logged><AdminLogin /></Logged>
  },
  {
    path: path.OTP,
    element: <LoginRequire><VerifyOtp /></LoginRequire>
  },
  {
    path: path.PERSONAL,
    element: <LoginRequire><Personal /></LoginRequire>
  },
  {
    path: path.HOME,
    element: <LoginRequire><Home /></LoginRequire>,
    handle: {
      crumb: (match: UIMatch) =>
        <Link key={match.pathname} to={match.pathname}>
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
          crumb: (match: UIMatch) =>
            <Link key={match.pathname} to={match.pathname}>
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
            element: <UserDetail />,
            handle: {
              crumb: ({ pathname }: UIMatch) => <span key={pathname}>New</span>
            }
          },
          {
            path: path.ID,
            element: <UserDetail />,
            loader: loadUserDetail,
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
          crumb: (match: UIMatch) =>
            <Link key={match.pathname} to={match.pathname}>
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
            loader: loadAllCategory,
            handle: {
              crumb: ({ pathname, name }: NavigationRouteMatchType) =>
                <span key={pathname}>{name}</span>
            }
          },
          {
            path: path.NEW,
            element: <BookDetail />,
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
          crumb: (match: UIMatch) =>
            <Link key={match.pathname} to={match.pathname}>
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
