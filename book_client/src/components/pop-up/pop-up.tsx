import { JSX } from 'react';
import Button from 'components/button/button';
import './style.scss';

function PopUp(): JSX.Element {
  return (
    <div className="pop-up">
      <div className="title">Category</div>
      <div className="body">
        <div className="content">
          content
        </div>
        <div className="btn-cancel-wrapper">
          <Button className="btn-cancel" onClick={() => {}}>
            &#10761;
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PopUp;
