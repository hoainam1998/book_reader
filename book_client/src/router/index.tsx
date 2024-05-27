import {
  Route,
  Navigate,
  Outlet,
  Link,
  createBrowserRouter,
  createRoutesFromElements,
  UIMatch,
} from 'react-router-dom';
import Home from 'views/home/home';
import CategoryList from 'views/category-group/category-list/category-list';
import CategoryDetail from 'views/category-group/category-detail/category-detail';
import BookList from 'views/book-group/book-list/book-list';
import BookDetail from 'views/book-group/book-detail/book-detail';
import path from './paths';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={path.ROOT} element={<Navigate replace to={path.HOME} />} />
      <Route path={path.HOME} element={<Home />}
        handle={{ crumb: (match: UIMatch<any, any>) => <Link key={match.pathname} to={match.pathname}>Home</Link> }}>
        <Route index element={<Navigate replace to={path.CATEGORY} />} />
        <Route path={path.CATEGORY} element={<Outlet />}
          handle={{ crumb: (match: UIMatch<any, any>) =>
            <Link key={match.pathname} to={match.pathname}>Categories</Link> }}>
          <Route index element={<CategoryList />} />
          <Route path={path.ID} element={<CategoryDetail />}
            handle={{ crumb: (match: UIMatch<any, any>) => <span key={match.pathname}>{match.params.id}</span> }} />
        </Route>
        <Route path={path.BOOK} element={<Outlet />}>
          <Route index element={<BookList />} />
          <Route path={path.ID} element={<BookDetail />} />
        </Route>
      </Route>
      <Route path={path.LOGIN} element={<div>login</div>} />
    </>
  )
);

export default router;
