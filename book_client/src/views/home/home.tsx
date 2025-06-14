import { JSX } from 'react';
import Menu from 'components/menu/menu';
import Header from 'components/header/admin-header/header';
import Content from 'components/content/content';
import Footer from 'components/footer/footer';
import './style.scss';

function Home(): JSX.Element {
  return (
    <section className="home">
      <Header />
      <div className="main-wrapper">
        <Menu />
        <Content />
      </div>
      <Footer />
    </section>
  );
}

export default Home;
