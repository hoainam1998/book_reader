import './style.scss';

function Header(): JSX.Element {
  return (
    <header className="header">
      <img src={require('images/book.png')} alt="logo" width="40" height="40" />
      <div className="personal-information-group">
        <button className="button-avatar">
          <img src={require('images/book.png')} alt="logo" width="30" height="30" />
        </button>
        <span>username</span>
      </div>
    </header>
  );
}

export default Header;
