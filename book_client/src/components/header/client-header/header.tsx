import { JSX} from 'react';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import { Link } from 'react-router-dom';
import path from 'router/paths';
import './style.scss';

function Header(): JSX.Element {
  return (
    <header className="client-header-wrapper">
      <Link to={path.HOME}>
        <img src={require('images/book.png')} alt="logo" width="40" height="40" />
      </Link>
      <HeaderDashboard hiddenNewBtn={true} search={() => {}} className="client-search" />
    </header>
  );
}

export default Header;
