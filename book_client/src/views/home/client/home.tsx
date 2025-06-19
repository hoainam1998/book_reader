import { JSX } from 'react';
import Menu from 'components/menu/client-menu/menu';
import Header from 'components/header/client-header/header';
import './style.scss';
import { Outlet } from 'react-router-dom';

function Home(): JSX.Element {
  return (
    <section className="client-layout">
      <Menu />
      <section className="client-home">
        <Header />
        <div className="client-content">
          <Outlet />
        </div>
      </section>
    </section>
  );
}

export default Home;
