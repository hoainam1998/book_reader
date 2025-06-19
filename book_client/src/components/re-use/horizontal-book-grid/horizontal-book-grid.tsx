import { JSX, ReactElement } from 'react';
import './style.scss';

type HorizontalBookGridPropsType = {
  children: ReactElement[];
};

function HorizontalBookGrid({ children }: HorizontalBookGridPropsType): JSX.Element {
  return (
    <div className="horizontal-book-grid">
      {children}
    </div>
  );
}

export default HorizontalBookGrid;
