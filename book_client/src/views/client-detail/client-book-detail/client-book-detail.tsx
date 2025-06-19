import { JSX } from 'react';
import { Link } from 'react-router-dom';
import path from 'router/paths';
import Button from 'components/button/button';
import './style.scss';

const authorLink = `${path.HOME}/${path.AUTHOR}/1234`;

function ClientBookDetail(): JSX.Element {
  return (
    <section className="client-book-detail">
      <div className="client-book-info">
        <div className="client-book-images">
          <img className="current-image" src={require('images/application.png')} />
          <ul className="client-book-images-library">
            <li>
              <img src={require('images/application.png')} />
            </li>
            <li>
              <img src={require('images/application.png')} />
            </li>
            <li>
              <img src={require('images/application.png')} />
            </li>
            <li>
              <img src={require('images/application.png')} />
            </li>
            <li>
              <img src={require('images/application.png')} />
            </li>
          </ul>
        </div>
        <div className="client-book-info">
          <ul>
            <li>
              <h3>W3Schools Free Online Web Tutorials</h3>
            </li>
            <li className="book-info-property">
              <span className="property-label">Author:</span>
              <ul className="author-links">
                <li><Link to={authorLink}>author 1</Link></li>
                <li><Link to={authorLink}>author 2</Link></li>
              </ul>
            </li>
            <li className="book-info-property">
              <span className="property-label">Category:</span>
              <span>author 1</span>
            </li>
            <li className="book-info-property">
              <span className="property-label">Published time:</span>
              <span>2</span>
            </li>
            <li className="book-info-property">
              <span className="property-label">Published day:</span>
              <span>2</span>
            </li>
            <li className="book-info-property book-operator">
              <Button variant="dangerous" className="operator-button" onClick={console.log}>
                <img src={require('images/heart.png')} className="icon-btn" />
                Favorite
              </Button>
              <Button variant="success" className="operator-button" onClick={console.log}>
                <img src={require('images/heart.png')} className="icon-btn" />
                Read later
              </Button>
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

export default ClientBookDetail;
