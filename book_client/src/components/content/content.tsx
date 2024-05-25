import { Outlet } from 'react-router-dom';
import './style.scss';

function Content(): JSX.Element {
  return (
    <main className="main">
      <nav></nav>
      <Outlet />
    </main>
  );
}

export default Content;
