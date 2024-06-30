import { JSX } from 'react';
import Menu from 'components/menu/menu';
import Header from 'components/header/header';
import Content from 'components/content/content';
import './style.scss';

function Home(): JSX.Element {
  return (
    <div className="home">
      <Header />
      <div className="main-wrapper">
        <Menu />
        <Content />
      </div>
    </div>
  );
}

export default Home;
