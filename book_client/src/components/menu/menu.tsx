import { NavLink } from 'react-router-dom';
import './style.scss';
import { clsx } from 'utils';
import path from '../../router/paths';

function Menu(): JSX.Element {
  return (
    <section className="menu-wrapper">
      <ul className="menu">
        <li className="menu-item">
          <NavLink to={path.CATEGORY} className={({ isActive }) => clsx({'active': isActive}) }>
            <div className="menu-icon">
              <img src={require('images/application.png')} alt="menu-icon" width="30" height="30"/>
            </div>
            categories
          </NavLink>
        </li>
        <li className="menu-item">
          <NavLink to={path.BOOK}>
            <div className="menu-icon">
              <img src={require('images/book.png')} alt="menu-icon" width="30" height="30"/>
            </div>
            books
          </NavLink>
        </li>
      </ul>
    </section>
  );
}

export default Menu;
