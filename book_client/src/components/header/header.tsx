import { JSX, useSyncExternalStore, useCallback, useRef, CSSProperties } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { createRoot, Root } from 'react-dom/client';
import { createElementWrapper, showToast } from 'utils';
import Button from 'components/button/button';
import Tooltip from 'components/tooltip/tooltip';
import store, { UserLogin } from 'store/auth';
import paths from 'router/paths';
import { logout as logoutApi } from 'views/login-group/login/admin-login/fetcher';
import useUpdatePositionAcrossWindowSize from 'hooks/useUpdatePositionAcrossWindowSize';
const { getSnapshot, subscribe } = store;
import './style.scss';

const bodyDOM: HTMLElement = document.body;
const menuContainer = createElementWrapper('menu-dropdown', 'menu-dropdown');
const defaultOffset: number = 10;
let hideMenu: () => void = () => {};

type MenuDropdownPropsType = {
  navigate: NavigateFunction;
  onPositionChange: () => CSSProperties;
};

function MenuDropdown({ navigate, onPositionChange }: MenuDropdownPropsType): JSX.Element {
  const position = useUpdatePositionAcrossWindowSize(onPositionChange);

  const personalSetting = useCallback((): void => {
    hideMenu();
    navigate(paths.PERSONAL);
  }, []);

  const logout = useCallback((): void => {
    hideMenu();
    logoutApi()
      .then((response) => {
        showToast('Logout!', response.data.message);
        store.logout();
        setTimeout(() => navigate(paths.LOGIN), 200);
      })
      .catch((error) => showToast('Logout!', error.response.data.message));
  }, []);

  if (!Object.keys(position).length) {
    return <></>;
  }

  return (
    <ul className="menu-content position-fixed" style={position}>
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

  const calculateMenuPosition = useCallback(() => {
    if (personalBoxRef.current) {
      const offsetTopInformationBox: number = personalBoxRef.current.offsetTop;
      const height: number = personalBoxRef.current.offsetHeight;
      return {
        left: personalBoxRef.current?.offsetLeft,
        top: offsetTopInformationBox + height + defaultOffset
      };
    }
    return {
      left: 10,
      top: 0
    };
  }, [personalBoxRef.current]);

  const toggleMenuDropdown = useCallback(() => {
    if (!bodyDOM.contains(menuContainer)) {
      bodyDOM.appendChild(menuContainer);
      const root: Root = createRoot(menuContainer);
      root.render(<MenuDropdown navigate={navigate} onPositionChange={calculateMenuPosition} />);
      hideMenu = () => {
        root.unmount();
        bodyDOM.removeChild(menuContainer);
      };
    } else {
      hideMenu();
    }
  }, []);

  return (
    <header className="header-wrapper">
      <div className="header">
        <img src={require('images/book.png')} alt="logo" width="40" height="40" />
        <div className="personal-information-group" ref={personalBoxRef}>
          <Button className="button-avatar" onClick={toggleMenuDropdown}>
            <img src={avatar} alt="logo" width="30" height="30" />
          </Button>
          <div>
            <span data-testid="name">{name}</span>
            <Tooltip>
              <p className="email" data-tooltip={email} data-testid="email">{email}</p>
            </Tooltip>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
