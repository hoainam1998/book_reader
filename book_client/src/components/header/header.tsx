import { JSX, useSyncExternalStore } from 'react';
import Button from 'components/button/button';
import store, { UserLogin } from 'store/auth';
import './style.scss';

function Header(): JSX.Element {
  const { getSnapshot, subscribe } = store;
  const { name, email, avatar }: UserLogin = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <header className="header">
      <img src={require('images/book.png')} alt="logo" width="40" height="40" />
      <div className="personal-information-group">
        <Button className="button-avatar" onClick={() => {}}>
          <img src={avatar} alt="logo" width="30" height="30" />
        </Button>
        <div>
          <span>{name}</span>
          <p className="email">{email}</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
