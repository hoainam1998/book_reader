import { JSX, useSyncExternalStore, useCallback, useRef, useEffect } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper } from 'utils';
import Button from 'components/button/button';
import store, { UserLogin } from 'store/auth';
import paths from 'paths';
const { getSnapshot, subscribe } = store;
import './style.scss';

const bodyDOM: HTMLElement = document.body;
const menuContainer = createElementWrapper('menu-dropdown', 'menu-dropdown');
const defaultOffset: number = 10;
let offsetTop: number = 0;
let offsetLeft: number = 10;
let hideMenu: () => void = () => {};

type MenuDropdownPropsType = {
  navigate: NavigateFunction;
};

function MenuDropdown({ navigate }: MenuDropdownPropsType): JSX.Element {

  const personalSetting = useCallback(() => {
    hideMenu();
    navigate(paths.PERSONAL);
  }, []);

  const logout = useCallback(() => {
    hideMenu();
    store.logout();
    navigate(paths.LOGIN);
  }, []);

  return (
    <ul className="menu-content">
      <li onClick={personalSetting}>
        <img src={require('images/icons/person.svg')} width="20" height="20" alt="personal" />
        Personal
      </li>
      <li onClick={logout}>
        <img src={require('images/icons/logout.svg')} width="20" height="20" alt="logout" />
        Logout
      </li>
    </ul>
  );
};

function Header(): JSX.Element {
  const userLogin: UserLogin | null = useSyncExternalStore(subscribe, getSnapshot);
  if (!userLogin) {
    return <></>;
  }

  const navigate = useNavigate();
  const { avatar, name, email } = userLogin;
  const personalBoxRef = useRef<HTMLDivElement>(null);

  const toggleMenuDropdown = useCallback(() => {
    if (!bodyDOM.contains(menuContainer)) {
    menuContainer.style.top = `${offsetTop}px`;
    menuContainer.style.left = `${offsetLeft}px`;
    bodyDOM.appendChild(menuContainer);
    const root: Root = createRoot(menuContainer);
    root.render(<MenuDropdown navigate={navigate} />);
    hideMenu = () => root.unmount();
    } else {
      hideMenu();
    }
  }, []);

  useEffect(() => {
    const offsetTopInformationBox: number = personalBoxRef.current?.offsetTop as number;
    const height: number = personalBoxRef.current?.offsetHeight as number;
    offsetLeft = personalBoxRef.current?.offsetLeft as number;
    offsetTop = offsetTopInformationBox + height + defaultOffset;
  }, []);

  return (
    <header className="header">
      <img src={require('images/book.png')} alt="logo" width="40" height="40" />
      <div className="personal-information-group" ref={personalBoxRef}>
        <Button className="button-avatar" onClick={toggleMenuDropdown}>
          <img src={avatar} alt="logo" width="30" height="30" />
        </Button>
        <div>
          <span data-testid="name">{name}</span>
          <p className="email" data-testid="email">{email}</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
