import { JSX, useCallback } from 'react';
import List from 'components/list/list';
import { useNavigate } from 'react-router-dom';
import { BookPropsType } from 'interfaces';
import path from 'router/paths';
import './style.scss';
import { clsx } from 'utils';

function Book({ bookId, name, avatar, authors }: BookPropsType): JSX.Element {
  const navigate = useNavigate();

  const navigateToBookDetail = useCallback((): void => {
    const bookAuthorDetail =`${path.HOME}/${path.BOOK}/${bookId}`;
    navigate(bookAuthorDetail);
  }, []);

  const navigateToAuthorDetail = useCallback((event: any, authorId: string): void => {
    event.preventDefault();
    event.stopPropagation();
    const authorDetailPath = `${path.HOME}/${path.AUTHOR}/${authorId}`;
    navigate(authorDetailPath);
  }, []);

  return (
    <div className="book" onClick={navigateToBookDetail}>
      <img className="item-book-avatar" src={avatar} />
      <div className="book-quick-info">
        <div className={clsx('author-images', { 'multiple-images': authors.length > 1 })}>
          <List<typeof authors[0]> items={authors}
            render={({ avatar }) => (<img src={avatar} className="author-avatar" />)}/>
        </div>
        <div className="left-info">
          <h4 className="book-name">{name}</h4>
          <ul>
            <List<typeof authors[0]> items={authors} render={({ authorId, name }) => (
              <li>
                <h5 className="author-name" onClick={(event) => navigateToAuthorDetail(event, authorId)}>{name}</h5>
              </li>
            )} />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Book;
