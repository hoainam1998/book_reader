import { Fragment, JSX, ReactElement, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NavLinkPropsType } from 'interfaces';
import path from 'router/paths';
import Button from 'components/button/button';
import { stringRandom as id, clsx } from 'utils';
import './style.scss';

const itemsMenu: NavLinkPropsType[] = [
  {
    path: path.ALL,
    label: 'All',
    image: 'home.png',
  },
  {
    path: path.CATEGORIES,
    label: 'Category',
    image: 'home.png',
    children: [
      {
        path: `${path.CATEGORIES}/1`,
        label: 'Category',
        image: 'home.png',
      },
      {
        path: `${path.CATEGORIES}/2`,
        label: 'Category',
        image: 'home.png',
      },
      {
        path: `${path.CATEGORIES}/3`,
        label: 'Category',
        image: 'home.png',
      }
    ]
  },
  {
    path: path.AUTHORS,
    label: 'Category',
    image: 'home.png',
    children: [
      {
        path: `${path.AUTHORS}/1`,
        label: 'Category',
        image: 'home.png',
      },
      {
        path: `${path.AUTHORS}/2`,
        label: 'Category',
        image: 'home.png',
      },
      {
        path: `${path.AUTHORS}/3`,
        label: 'Category',
        image: 'home.png',
      },
    ]
  }
];

const createItemMenu = (item: NavLinkPropsType): ReactElement => {
  const isDisableLink = ([path.AUTHORS, path.CATEGORIES] as string[]).includes(item.path);
  return (
    <li className="menu-item" key={id()}>
      <NavLink to={item.path} className={
        ({ isActive }) => isActive
          ? clsx('active', isDisableLink && 'link-disabled')
          : clsx(isDisableLink && 'link-disabled')
        }>
        <img src={require(`images/${item.image}`)} height="35" width="35" />
        <span className="name line-clamp">{item.label}</span>
      </NavLink>
    </li>
  );
};

const flatItemsMenu = (items: NavLinkPropsType[], level: () => number = () => 0): any[] => {
  return items.flatMap((item) => {
    let currentLevel: number = level();
    const levelUp = () => currentLevel > 0 ? currentLevel -= 1: currentLevel;
    if (item.children) {
      return (
        <Fragment key={id()}>
          { createItemMenu(item) }
          <ul style={{ paddingLeft: `${++currentLevel * 20}px` }}>
            { flatItemsMenu(item.children, levelUp) }
          </ul>
        </Fragment>
      );
    }
    return createItemMenu(item);
  });
};

function Menu(): JSX.Element {
  const navigate = useNavigate();
  const navigateToPersonal = useCallback((): void => {
    navigate(`${path.HOME}${path.PERSONAL}`);
  }, []);

  return (
    <section className="client-menu-wrapper">
      <ul className="menu">
        {flatItemsMenu(itemsMenu)}
      </ul>
      <div className="user-login-box">
        <div className="user-login-quick-info">
          <img src={require('images/home.png')} height={50} width={50} />
          <h5 className="line-clamp">hfhhfhfffffffffffffffffffffffffffffafhafh@gmail.com</h5>
        </div>
        <hr className="separate-line" />
        <div className="personal-operator-btn">
          <Button variant="outline" className="flex-basic-50" onClick={navigateToPersonal}>Personal</Button>
          <Button variant="outline" className="flex-basic-50" onClick={() => {}}>Logout</Button>
        </div>
      </div>
    </section>
  );
}

export default Menu;
