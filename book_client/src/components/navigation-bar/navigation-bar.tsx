import { JSX } from 'react';
import { UIMatch, useMatches } from 'react-router-dom';

type Handle = {
  // eslint-disable-next-line no-unused-vars
  crumb?: (match: UIMatch) => JSX.Element;
};

function NavigationBar(): JSX.Element {
  const matches = useMatches();

  return (
    <nav className="navigation">
      {
        matches.filter((match: UIMatch) => Boolean(match.handle && (match.handle as Handle).crumb))
          .map((match: UIMatch) => (match.handle as Handle).crumb!(match))
      }
    </nav>
  );
}

export default NavigationBar;
