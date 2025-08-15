import { JSX, useCallback } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import HeaderDashboard from 'components/header-dashboard/header-dashboard';
import { useClientPaginationContext } from 'contexts/client-pagination';
import path from 'router/paths';
import './style.scss';

function Header(): JSX.Element {
  const navigate = useNavigate();
  const { onPageChange, setCondition, shouldCallOnPageChange } = useClientPaginationContext();

  const search = useCallback((keyword: string): void => {
    if (onPageChange) {
      const allUrl: string = `${path.HOME}/${path.ALL}${keyword ? `?keyword=${keyword}` : ''}`.trim();
      if (shouldCallOnPageChange()) {
        onPageChange(1, { keyword });
      }
      setCondition({ keyword });
      navigate(allUrl);
    }
  }, [onPageChange]);

  return (
    <header className="client-header-wrapper">
      <Link to={path.HOME}>
        <img src={require('images/book.png')} alt="logo" width="40" height="40" />
      </Link>
      <HeaderDashboard hiddenNewBtn={true} search={search} className="client-search" />
    </header>
  );
}

export default Header;
