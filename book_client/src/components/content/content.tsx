import { JSX } from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from 'components/navigation-bar/navigation-bar';
import { useLastNavigateNameContext } from 'contexts/last-name-navigate-bar';
import './style.scss';

function Content(): JSX.Element {
  const { name } = useLastNavigateNameContext();

  return (
    <main className="content">
      <NavigationBar lastStepName={name}/>
      <section className="content-box">
        <Outlet />
      </section>
    </main>
  );
}

export default Content;
