import { Outlet, UIMatch, useMatches } from 'react-router-dom';
import Footer from 'components/footer/footer';
import './style.scss';

// eslint-disable-next-line no-unused-vars
type Handle = { crumb?: (match: UIMatch<any, any>) => JSX.Element };

function Content(): JSX.Element {
  const matches = useMatches();

  return (
    <main className="content">
      <nav className="navigation">
        {
          matches.filter((match: UIMatch<any, unknown>) => Boolean(match.handle && (match.handle as Handle).crumb))
            .map((match: UIMatch<any, unknown>) => (match.handle as Handle).crumb!(match))
        }
      </nav>
      <section className="content-box">
        <Outlet />
      </section>
      <Footer />
    </main>
  );
}

export default Content;
