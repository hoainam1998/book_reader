import { JSX } from 'react';
import Button from 'components/button/button';
import './style.scss';

function BookConclusion(): JSX.Element {
  return (
    <section className="book-conclusion">
      <div className="information-section">
        <div className="image-box-wrapper">
          <span className="field-name">Images</span>
          <div className="image-selected image-box"></div>
        </div>
        <ul className="information-detail">
          <li className="information-detail-item">
            <span className="field-name">Images</span>
            <span>information</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Images</span>
            <span>information</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Images</span>
            <span>information</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Images</span>
            <span>information</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Images</span>
            <span>information</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Images</span>
            <span>information</span>
          </li>
        </ul>
      </div>
      <Button onClick={() => {}} variant="submit" className="btn-complete">Save</Button>
    </section>
  );
}

export default BookConclusion;
