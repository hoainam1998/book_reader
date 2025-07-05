import { JSX, useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useComponentDidMount from 'hooks/useComponentDidMount';
import { useClientPaginationContext } from 'contexts/client-pagination';
import path from 'router/paths';
import constants from 'read-only-variables';
import { HaveLoadedFnType } from 'interfaces';
import { getAuthorDetail } from './fetcher';
import { formatDate } from 'utils';
import './style.scss';

type AuthorDetailType = {
  name: string;
  avatar: string;
  sex: number;
  yearOfDead: number;
  yearOfBirth: number;
  storyFile: {
    html: string;
  }
};

function ClientAuthorDetail(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<AuthorDetailType | null>(null);
  const { onPageChange, setCondition } = useClientPaginationContext();
  const allBookLink = useMemo<string>(() => `${path.HOME}/${path.AUTHORS}/${id}`, [id]);

  useComponentDidMount((haveFetched: HaveLoadedFnType) => {
    return () => {
      if (!haveFetched() && id) {
        getAuthorDetail(id)
          .then((result) => setAuthor(result.data))
          .catch(() => setAuthor(null));
      }
    };
  }, []);

  const navigateToAuthors = useCallback((event: any): void => {
    event.preventDefault();
    setCondition({ id });
    navigate(allBookLink);
  }, [allBookLink, onPageChange]);

  if (author) {
    return (
      <section className="client-book-detail">
        <div className="client-book-info">
          <div className="client-book-images">
            <img className="current-image" src={author.avatar} />
          </div>
          <div className="client-book-info">
            <ul>
              <li><h3>{author.name}</h3></li>
              <li className="book-info-property">
                <span className="property-label">Sex:</span>
                <span>{constants.SEX[author.sex]}</span>
              </li>
              <li className="book-info-property">
                <span className="property-label">Birth:</span>
                <span>{formatDate(author.yearOfBirth)}</span>
              </li>
              <li className="book-info-property">
                <span className="property-label">Dead:</span>
                <span>{formatDate(author.yearOfDead)}</span>
              </li>
              <li className="book-info-property">
                <span className="author-book-link" onClick={navigateToAuthors}>All book</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="client-book-story-info">
          <iframe src={`${process.env.BASE_URL}/${author.storyFile.html}`}
            title="W3Schools Free Online Web Tutorials"></iframe>
        </div>
      </section>
    );
  }
  return (<></>);
}

export default ClientAuthorDetail;
