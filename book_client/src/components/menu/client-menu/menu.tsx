import { Fragment, JSX, ReactElement, useCallback, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HaveLoadedFnType, NavLinkPropsType } from 'interfaces';
import path from 'router/paths';
import Button from 'components/button/button';
import useComponentWillMount from 'hooks/useComponentWillMount';
import { useClientPaginationContext } from 'contexts/client-pagination';
import { stringRandom as id, clsx } from 'utils';
import { getMenuItem } from './fetcher';
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
    image: 'application.png',
  },
  {
    path: path.AUTHORS,
    label: 'Author',
    image: 'writer.png',
  }
];

type MenuItemApi = {
  [key: string]: string;
};

const menuItemMapping = (
  menuItems: MenuItemApi[],
  parentPath: string,
  onChange: (id: string, path: string) => void
): NavLinkPropsType[] => {
  const idField = {
    [path.CATEGORIES]: 'categoryId',
    [path.AUTHORS]: 'authorId',
  };

  return menuItems.map((menuItem: MenuItemApi): NavLinkPropsType => {
    const item = {
      label: menuItem.name,
      image: menuItem.avatar,
      id: menuItem[idField[parentPath as keyof typeof idField]],
      path: `${parentPath}/${menuItem[idField[parentPath as keyof typeof idField]]}`,
      loader: onChange,
    };

    return item;
  });
};

const createItemMenu = (item: NavLinkPropsType): ReactElement => {
  const isDisableLink = ([path.AUTHORS, path.CATEGORIES] as string[]).includes(item.path);
  return (
    <li className="menu-item" key={id()}>
      <NavLink to={item.path} className={
        ({ isActive }) => isActive
          ? clsx('active', isDisableLink && 'link-disabled')
          : clsx(isDisableLink && 'link-disabled')
        }
        onClick={(event) => {
          event.preventDefault();
          item.loader!(item.id!, item.path);
        }}>
        {
          ([path.AUTHORS, path.CATEGORIES, path.ALL] as string[]).includes(item.path)
          ? <img src={require(`images/${item.image}`)} height="35" width="35" />
          : <img src={item.image} height="35" width="35" />
        }
        <span className="name line-clamp">{item.label}</span>
      </NavLink>
    </li>
  );
};

const flatItemsMenu = (
  items: NavLinkPropsType[],
  level: () => number = () => 0
): ReactElement[] => {
  return items.flatMap((item) => {
    let currentLevel: number = level();
    const levelUp = () => currentLevel > 0 ? currentLevel -= 1: currentLevel;
    if (item.children) {
      return (
        <Fragment key={id()}>
          {createItemMenu(item)}
          <ul style={{ paddingLeft: `${++currentLevel * 20}px` }}>
            {flatItemsMenu(item.children, levelUp)}
          </ul>
        </Fragment>
      );
    }
    return createItemMenu(item);
  });
};

function Menu(): JSX.Element {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<NavLinkPropsType[]>(itemsMenu);
  const { onPageChange, setConditions } = useClientPaginationContext();

  const navigateToPersonal = useCallback((): void => {
    navigate(`${path.HOME}${path.PERSONAL}`);
  }, []);

  const loader = useCallback((): (id: string, subUrl: string) => void => {
    if (onPageChange) {
      return (id: string, subUrl: string): void => {
        navigate(`${path.HOME}/${subUrl}`);
        setConditions({ id });
        onPageChange(1, { id });
      };
    }
    return () => {};
  }, [onPageChange]);

  useComponentWillMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched()) {
        const allMenuItem = itemsMenu[0];
        const categoryMenu = itemsMenu[1];
        const authorMenu = itemsMenu[2];
        if (onPageChange) {
          getMenuItem().then((result) => {
            const menu = result.map((result) => {
              if (result.config.url?.includes('category')) {
                categoryMenu.children = menuItemMapping(result.data, path.CATEGORIES, loader());
                return categoryMenu;
              } else {
                authorMenu.children = menuItemMapping(result.data, path.AUTHORS, loader());
                return authorMenu;
              }
            });
            menu.unshift(allMenuItem);
            setMenuItems(menu);
          });
        }
      }
    };
  }, [loader]);

  return (
    <section className="client-menu-wrapper">
      <ul className="menu">
        {flatItemsMenu(menuItems)}
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
