import { JSX, useCallback, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useComponentDidMount from 'hooks/useComponentDidMount';
import path from 'router/paths';
import Button from 'components/button/button';
import List from 'components/list/list';
import { useClientPaginationContext } from 'contexts/client-pagination';
import { getBookDetail } from './fetcher';
import { openFile } from 'utils';
import { HaveLoadedFnType, BookPropsType } from 'interfaces';
import { formatDate } from 'utils';
import './style.scss';

const authorLink = `${path.HOME}/${path.AUTHOR}`;
const categoryLink = `${path.HOME}/${path.CATEGORIES}`;

type BookDetailPropsType = {
  name: string;
  pdf: string;
  publishedDay: string;
  publishedTime: number;
  introduce: {
    html: string;
  };
  images: {
    image: string;
    name: string;
  }[];
  category: {
    categoryId: string;
    name: string;
  };
  authors: BookPropsType['authors'];
};

function ClientBookDetail(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onPageChange, setCondition } = useClientPaginationContext();
  const [book, setBook] = useState<BookDetailPropsType | null>(null);
  const avatarBoxRef = useRef<HTMLImageElement>(null);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched() && id) {
        getBookDetail(id)
          .then((result) => setBook(result.data))
          .catch(() => setBook(null));
      }
    };
  }, []);

  const bookOnChange = useCallback((event: any): void => {
    if (book && book.images.length) {
      avatarBoxRef.current!.src = event.target.src;
    }
  }, [book]);

  const navigateToCategories = useCallback((event: any): void => {
    event.preventDefault();
    if (book) {
      setCondition({ id: book.category.categoryId });
      navigate(`${categoryLink}/${book.category.categoryId}`);
    }
  }, [book, onPageChange]);

  if (book) {
    return (
      <section className="client-book-detail">
        <div className="client-book-info">
          <div className="client-book-images">
            <img className="current-image" alt="main-avatar" src={book.images[0].image} ref={avatarBoxRef} />
            <ul className="client-book-images-library">
              <List<typeof book.images[0]> items={book.images} render={({ image, name }) => (
                <li><img src={image} alt={name} onClick={bookOnChange} /></li>
              )}/>
            </ul>
          </div>
          <div className="client-book-info">
            <ul>
              <li><h3>{book.name}</h3></li>
              <li className="book-info-property">
                <span className="property-label">Author:</span>
                <ul className="author-links">
                  <List<typeof book.authors[0]> items={book.authors} render={({ authorId, name, avatar }) => (
                    <li>
                      <Link to={`${authorLink}/${authorId}`} className="author-link">
                        <img src={avatar} alt={name} className="author-avatar" />
                        {name}
                      </Link>
                    </li>
                  )} />
                </ul>
              </li>
              <li className="book-info-property">
                <span className="property-label">Category:</span>
                <span className="category-link" onClick={navigateToCategories}>{book.category.name}</span>
              </li>
              <li className="book-info-property">
                <span className="property-label">Published time:</span>
                <span>{book.publishedTime}</span>
              </li>
              <li className="book-info-property">
                <span className="property-label">Published day:</span>
                <span>{formatDate(book.publishedDay)}</span>
              </li>
              <li className="book-info-property book-operator">
                <Button variant="dangerous" className="operator-button" onClick={() => openFile(book.pdf)}>
                  <img src={require('images/book.png')} className="icon-btn" />
                  Read
                </Button>
                <Button variant="dangerous" className="operator-button" onClick={console.log}>
                  <img src={require('images/heart.png')} className="icon-btn" />
                  Favorite
                </Button>
                <Button variant="success" className="operator-button" onClick={console.log}>
                  <img src={require('images/watch-later.png')} className="icon-btn" />
                  Read later
                </Button>
              </li>
            </ul>
          </div>
        </div>
        <div className="client-book-story-info">
          <iframe src={`${process.env.BASE_URL}/${book.introduce.html}`}
            title="W3Schools Free Online Web Tutorials" />
        </div>
      </section>
    );
  }
  return (<></>);
}

export default ClientBookDetail;
