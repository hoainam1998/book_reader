import { JSX } from 'react';
import './style.scss';

function HorizontalBook(): JSX.Element {
  return (
    <div className="horizontal-book">
      <img className="book-avatar" src={require('images/application.png')} />
      <div className="horizontal-book-info">
        <h5 className="horizontal-book-info-name">name faf fafa fafa fafaf fafag fafafaga afagaga a</h5>
        <span className="horizontal-book-info-author-name">author name</span>
      </div>
    </div>
  );
}

export default HorizontalBook;
