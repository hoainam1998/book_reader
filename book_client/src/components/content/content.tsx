import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from 'components/navigation-bar/navigation-bar';
import './style.scss';

function Content(): JSX.Element {
  return (
    <main className="content">
      <NavigationBar />
      <section className="content-box">
        <Outlet />
      </section>
    </main>
  );
}

export default Content;
