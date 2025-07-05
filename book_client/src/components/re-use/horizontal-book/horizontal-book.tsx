import { JSX } from 'react';
import { formatDate } from 'utils';
import { HorizontalBookType } from 'interfaces';
import './style.scss';

function HorizontalBook({ name, avatar, bookId, createAt }: HorizontalBookType): JSX.Element {
  return (
    <div className="horizontal-book">
      <img className="book-avatar" src={require('images/application.png')} />
      <div className="horizontal-book-info">
        <h5 className="horizontal-book-info-name">name faf fafa fafa fafaf fafag fafafaga afagaga a</h5>
        <span className="horizontal-book-info-author-name">author name</span>
        <span className="create-at">{formatDate(Date.now())}</span>
      </div>
      <button className="del-btn">x</button>
    </div>
  );
}

export default HorizontalBook;
