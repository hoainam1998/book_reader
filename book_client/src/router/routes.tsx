import { RouteProps, Navigate, Link, UIMatch, Outlet } from 'react-router-dom';
import Home from 'views/home/home';
import Category, { loadInitCategory } from 'views/category-group/category';
import BookDetail, { loadAllCategory, shouldRevalidateBookLoader } from 'views/book-group/book-detail/book-detail';
import ApiError from 'components/error/api-error/api-error';
import path from './paths';

export type RoutePropsUnion = Omit<RouteProps, 'children'> & {
  children?: RoutePropsUnion[];
};

const routes: RoutePropsUnion[] = [
  {
    path: path.ROOT,
    element: <Navigate replace to={path.HOME} />
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
            element: <BookDetail />,
            loader: loadAllCategory,
            shouldRevalidate: shouldRevalidateBookLoader
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
          }
        ]
      }
    ]
  }
];

export default routes;
