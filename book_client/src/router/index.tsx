import { JSX } from 'react';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import { RoutePropsUnion } from './interfaces';

import adminRoutes from './admin-routes';
import clientRoutes from './client-routes';

const routes: RoutePropsUnion[] = process.env.APP_NAME === 'client' ? clientRoutes : adminRoutes;

const renderRoutes = (routes: RoutePropsUnion[]): JSX.Element[] => {
  return routes.map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} {...route as any}>
          { renderRoutes(route.children) }
        </Route>
      );
    } else {
      return <Route key={index} {...route as any} />;
    }
  });
};

const router = createBrowserRouter(
  createRoutesFromElements(renderRoutes(routes))
);

export default router;
