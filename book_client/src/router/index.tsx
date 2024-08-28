import { JSX } from 'react';
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import routes, { RoutePropsUnion } from './routes';

const renderRoutes = (routes: RoutePropsUnion[]): JSX.Element[] => {
  return routes.map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} {...route as any}>
          { renderRoutes(route.children) }
        </Route>
      )
    } else {
      return <Route key={index} {...route as any} />
    }
  });
};

const router = createBrowserRouter(
  createRoutesFromElements(renderRoutes(routes))
);

export default router;
