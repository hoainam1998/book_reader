import { JSX } from 'react';
import { UIMatch, useMatches } from 'react-router-dom';
import './style.scss';

type Handle = {
  // eslint-disable-next-line no-unused-vars
  crumb?: (match: UIMatch) => JSX.Element;
};

function NavigationBar(): JSX.Element {
  const matches = useMatches();

  return (
    <section className="navigation-wrapper position-sticky">
      <nav className="navigation">
        {
          matches.filter((match: UIMatch) => Boolean(match.handle && (match.handle as Handle).crumb))
            .map((match: UIMatch) => (match.handle as Handle).crumb!(match))
        }
      </nav>
    </section>
  );
}

export default NavigationBar;
