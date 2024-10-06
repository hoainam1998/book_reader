import { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import List from 'components/list/list';
import { clsx } from 'utils';
import path from '../../router/paths';
import './style.scss';

type NavLinkPropsType = {
  path: string;
  label: string;
  image: string;
};

const navLinks: NavLinkPropsType[] = [
  {
    path: path.CATEGORY,
    label: 'categories',
    image: 'application.png'
  },
  {
    path: path.BOOK,
    label: 'books',
    image: 'book.png'
  },
  {
    path: path.USER,
    label: 'users',
    image: 'user-group.png'
  }
];

function Menu(): JSX.Element {
  return (
    <section className="menu-wrapper">
      <ul className="menu">
        <List<NavLinkPropsType> items={navLinks} render={({ path, label, image }) => (
          <li className="menu-item">
            <NavLink to={path} className={({ isActive }) => clsx({'active': isActive}) }>
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
