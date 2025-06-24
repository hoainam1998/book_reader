import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import Menu from 'components/menu/client-menu/menu';
import Header from 'components/header/client-header/header';
import ClientPagination from 'contexts/client-pagination';
import './style.scss';

function Home(): JSX.Element {
  return (
    <ClientPagination>
      <section className="client-layout">
        <Menu />
        <section className="client-home">
          <Header />
          <div className="client-content">
            <Outlet />
          </div>
        </section>
      </section>
    </ClientPagination>
  );
}

export default Home;
