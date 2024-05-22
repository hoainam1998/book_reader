import './style.scss';

function Menu() {
  return (
    <ul className="menu">
      <li className="menu-item">
        <img src={require("images/book.png")} alt="menu-icon" width="30" height="30"/>
        book
      </li>
      <li></li>
    </ul>
  );
}

export default Menu;
