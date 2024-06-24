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
import BookList from 'views/book-group/book-list/book-list';
import BookDetail from 'views/book-group/book-detail/book-detail';
import Category from 'views/category-group/category';
import path from './paths';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={path.ROOT} element={<Navigate replace to={path.HOME} />} />
      <Route path={path.HOME} element={<Home />}
        handle={{ crumb: (match: UIMatch<any, any>) => <Link key={match.pathname} to={match.pathname}>Home</Link> }}>
        <Route index element={<Navigate replace to={path.CATEGORY} />} />
        {/* <Route path={path.CATEGORY} element={<Outlet />}
          handle={{ crumb: (match: UIMatch<any, any>) =>
            <Link key={match.pathname} to={match.pathname}>Categories</Link> }}>
          <Route index element={<CategoryList />} />
          <Route path={path.ID} element={<CategoryDetail />}
            handle={{ crumb: (match: UIMatch<any, any>) => <span key={match.pathname}>{match.params.id}</span> }} />
        </Route> */}
        <Route path={path.CATEGORY} element={<Category />}
          handle={{ crumb: (match: UIMatch<any, any>) => <span key={match.pathname}>Categories</span> }} />
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
