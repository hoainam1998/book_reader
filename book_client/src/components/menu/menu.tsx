import { JSX, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import List from 'components/list/list';
import routes from '../../router/routes';
import { clsx } from 'utils';
import path from 'paths';
import './style.scss';

type NavLinkPropsType = {
  path: string;
  label: string;
  image: string;
};

function Menu(): JSX.Element {

  const navLinks = useMemo<NavLinkPropsType[]>(() => {
   return (routes.find(route => route.path === path.HOME)?.children || [])
    .reduce<NavLinkPropsType[]>((links, menuItem) => {
        if (menuItem.path) {
          links.push({ path: menuItem.path || '', label: menuItem.name || '', image: menuItem.icon || '' });
        }
        return links;
    }, []);
  }, [routes]);

  return (
    <section className="menu-wrapper">
      <ul className="menu position-fixed">
        <List<NavLinkPropsType> items={navLinks} render={({ path, label, image }) => (
          <li className="menu-item">
            <NavLink to={path} className={({ isActive }) => clsx({ 'active': isActive }) }>
              <div className="menu-icon">
                <img src={require(`images/${image}`)} alt="menu-icon" width="30" height="30"/>
              </div>
              {label}
            </NavLink>
        </li>
        )} />
      </ul>
    </section>
  );
}

export default Menu;
