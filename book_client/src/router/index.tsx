import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from 'views/home/home';
import CategoryList from 'views/category-group/category-list/category-list';
import CategoryDetail from 'views/category-group/category-detail/category-detail';
import path from './paths';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={path.ROOT} element={<Navigate replace to={path.HOME} />} />
        <Route path={path.HOME} element={<Home />}>
          <Route path={path.CATEGORY} element={<Outlet />}>
            <Route index element={<CategoryList />} />
            <Route path={path.ID} element={<CategoryDetail />} />
          </Route>
        </Route>
        <Route path={path.LOGIN} element={<div>login</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
