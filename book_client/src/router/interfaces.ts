import { RouteProps, UIMatch } from 'react-router-dom';

export type RoutePropsUnion = Omit<RouteProps, 'children'> & {
  children?: RoutePropsUnion[];
  name?: string;
  icon?: string;
};

export type NavigationRouteMatchType = UIMatch & { name: string };
