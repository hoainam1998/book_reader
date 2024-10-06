import { RouteProps, Navigate, Link, UIMatch, Outlet } from 'react-router-dom';
import Login from 'views/login-group/login/login';
import Home from 'views/home/home';
import UserList, { loadInitUser } from 'views/user/user-list/user-list';
import UserDetail, { loadUserDetail } from 'views/user/user-detail/user-detail';
import Category, { loadInitCategory } from 'views/category-group/category';
import BookDetail, { loadAllCategory, shouldRevalidateBookLoader } from 'views/book-group/book-detail/book-detail';
import BookList, { bookPagination } from 'views/book-group/book-list/book-list';
import ApiError from 'components/error/api-error/api-error';
import path from './paths';

export type RoutePropsUnion = Omit<RouteProps, 'children'> & {
  children?: RoutePropsUnion[];
};

const routes: RoutePropsUnion[] = [
  {
    path: path.ROOT,
    element: <Navigate replace to={path.LOGIN} />
  },
  {
    path: path.LOGIN,
    element: <Login />
  },
  {
    path: path.HOME,
    element: <Home />,
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
        element: <Category />,
        handle: {
          crumb: (match: UIMatch) =>
            <span key={match.pathname}>Categories</span>
        },
        loader: loadInitCategory,
        errorElement: <ApiError />
      },
      {
        path: path.USER,
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
            errorElement: <ApiError />
          },
          {
            path: 'new',
            element: <UserDetail />,
            handle: {
              crumb: ({ pathname }: UIMatch) =>
                <span key={pathname}>New</span>
            }
          },
          {
            path: path.ID,
            element: <UserDetail />,
            loader: loadUserDetail,
            handle: {
              crumb: ({ pathname, params }: UIMatch) =>
                <span key={pathname}>{params.id}</span>
            }
          },
        ]
      },
      {
        path: path.BOOK,
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
            loader: bookPagination
          },
          {
            path: path.ID,
            element: <BookDetail />,
            loader: loadAllCategory,
            shouldRevalidate: shouldRevalidateBookLoader,
            handle: {
              crumb: ({ pathname, params }: UIMatch) =>
                <span key={pathname}>{params.id}</span>
            }
          },
          {
            path: 'new',
            element: <BookDetail />,
            loader: loadAllCategory,
            shouldRevalidate: shouldRevalidateBookLoader,
            handle: {
              crumb: ({ pathname }: UIMatch) =>
                <span key={pathname}>New</span>
            }
          }
        ]
      }
    ]
  }
];

export default routes;
