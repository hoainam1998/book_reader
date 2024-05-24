import './style.scss';

function Menu(): JSX.Element {
  return (
    <section className="menu-wrapper">
      <ul className="menu">
        <li className="menu-item">
          <div className="menu-icon">
            <img src={require("images/book.png")} alt="menu-icon" width="30" height="30"/>
          </div>
          book
        </li>
        <li className="menu-item">
          <div className="menu-icon">
            <img src={require("images/book.png")} alt="menu-icon" width="30" height="30"/>
          </div>
          book
        </li>
        <li className="menu-item">
          <div className="menu-icon">
            <img src={require("images/book.png")} alt="menu-icon" width="30" height="30"/>
          </div>
          book
        </li>
        <li className="menu-item">
          <div className="menu-icon">
            <img src={require("images/book.png")} alt="menu-icon" width="30" height="30"/>
          </div>
          book
        </li>
        <li className="menu-item">
          <div className="menu-icon">
            <img src={require("images/book.png")} alt="menu-icon" width="30" height="30"/>
          </div>
          book
        </li>
      </ul>
    </section>
  );
}

export default Menu;
