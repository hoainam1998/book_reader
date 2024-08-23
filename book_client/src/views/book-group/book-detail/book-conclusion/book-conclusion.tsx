import { JSX, useSyncExternalStore } from 'react';
import Button from 'components/button/button';
import store, { CurrentStoreType } from '../storage';
import './style.scss';
const { updateStep, subscribe, getSnapshot } = store;

function BookConclusion(): JSX.Element {
  const { data }: CurrentStoreType = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <section className="book-conclusion">
      <div className="information-section">
        <div className="image-box-wrapper">
          <span className="field-name">Images</span>
          <div className="image-selected image-box">
            {
              data.images.map(({ image, name }) => <img src={image} alt={name} />)
            }
          </div>
        </div>
        <ul className="information-detail">
          <li className="information-detail-item">
            <span className="field-name">Name</span>
            <span>{data.name}</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Pdf</span>
            <span>{data.pdf}</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Publish Time</span>
            <span>{data.publishedTime}</span>
          </li>
          <li className="information-detail-item">
            <span className="field-name">Publish Day</span>
            <span>{data.publishedDay}</span>
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
