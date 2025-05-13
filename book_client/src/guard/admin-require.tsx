import { JSX, useMemo } from 'react';
import { Navigate, UIMatch, useMatches } from 'react-router-dom';
import auth from 'store/auth';
import paths from 'router/paths';
import { GuardPropsType  } from './type';

type AdminRequireGuardPropsType = GuardPropsType & {
  path?: string;
};

const getPreviousRoute = (routes: UIMatch[]): string => {
  routes = routes.reverse();
  routes.shift();
  if (routes.length) {
    return routes[0].pathname;
  }
  return paths.HOME;
};

const AdminRequire = ({ children, path }: AdminRequireGuardPropsType): JSX.Element => {
  const routes: UIMatch[] = useMatches();
  const navigatePath = useMemo<string>(() => {
    if (!path) {
      return  getPreviousRoute(routes);
    }
    return `${paths.HOME}/${path}`;
  }, [path]);

  if (auth.IsAdmin) {
    return children;
  } else {
    return (<Navigate to={navigatePath} />);
  }
};

export default AdminRequire;
