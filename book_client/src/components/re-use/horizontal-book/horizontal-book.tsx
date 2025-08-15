import { JSX } from 'react';
import { formatDate } from 'utils';
import List from 'components/list/list';
import { Link } from 'react-router-dom';
import path from 'router/paths';
import { HorizontalBookType } from 'interfaces';
import './style.scss';

function HorizontalBook({ name, avatar, createAt, authors, deleteBook }: HorizontalBookType): JSX.Element {
  return (
    <div className="horizontal-book">
      <img className="book-avatar" src={avatar} />
      <div className="horizontal-book-info">
        <h5 className="horizontal-book-info-name">{name}</h5>
        <ul className="horizontal-book-authors">
          <List<typeof authors[0]> items={authors} render={({ name, authorId }) =>
            (<li className="horizontal-book-authors-item">
              <Link
                className="horizontal-book-authors-item-author-name"
                to={`${path.HOME}/${path.AUTHORS}/${authorId}`}>
                  {name}
                </Link>
            </li>)
          } />
        </ul>
        {createAt && <span className="create-at">{formatDate(createAt)}</span>}
      </div>
      <button className="del-btn" onClick={deleteBook}>x</button>
    </div>
  );
}

export default HorizontalBook;
