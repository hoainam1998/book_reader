import { JSX, ReactNode } from 'react';
import Button from 'components/button/button';
import './style.scss';

type PopUpProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

function PopUp({ onClose, title, children }: PopUpProps): JSX.Element {
  return (
    <>
      <div className="title">{title}</div>
      <div className="body">
        <div className="content">
          {children}
        </div>
        <div className="btn-cancel-wrapper">
          <Button className="btn-cancel" onClick={onClose}>
            &#10761;
          </Button>
        </div>
      </div>
    </>
  );
}

export default PopUp;
