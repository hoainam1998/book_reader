import { JSX, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import path from 'router/paths';
import './style.scss';

function ClientAuthorDetail(): JSX.Element {
  const { id } = useParams();
  const allBookLink = useMemo<string>(() => `${path.HOME}/${path.AUTHORS}/${id}`, [id]);

  return (
    <section className="client-book-detail">
      <div className="client-book-info">
        <div className="client-book-images">
          <img className="current-image" src={require('images/application.png')} />
        </div>
        <div className="client-book-info">
          <ul>
            <li><h3>W3Schools Free Online Web Tutorials</h3></li>
            <li className="book-info-property">
              <span className="property-label">Author:</span>
              <span>author 1</span>
            </li>
            <li className="book-info-property">
              <span className="property-label">Category:</span>
              <span>category 1</span>
            </li>
            <li className="book-info-property">
              <span className="property-label">Published time:</span>
              <span>2</span>
            </li>
            <li className="book-info-property">
              <span className="property-label">Published day:</span>
              <span>2</span>
            </li>
            <li className="book-info-property">
              <Link className="author-book-link" to={allBookLink}>All book</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="client-book-story-info">
        <iframe src="https://www.w3schools.com" title="W3Schools Free Online Web Tutorials"></iframe>
      </div>
    </section>
  );
}

export default ClientAuthorDetail;
