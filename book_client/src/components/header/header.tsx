import Button from 'components/button/button';
import './style.scss';

function Header(): JSX.Element {
  return (
    <header className="header">
      <img src={require('images/book.png')} alt="logo" width="40" height="40" />
      <div className="personal-information-group">
        <Button className="button-avatar" onClick={() => {}}>
          <img src={require('images/book.png')} alt="logo" width="30" height="30" />
        </Button>
        <span>username</span>
      </div>
    </header>
  );
}

export default Header;
