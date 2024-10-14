import { JSX, ReactNode, useEffect } from 'react';
import Button from 'components/button/button';
import './style.scss';

type PopUpProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  updateHeight: () => void;
};

function PopUp({ title, children, onClose, updateHeight }: PopUpProps): JSX.Element {

  useEffect(() => {
    updateHeight();
  }, []);

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
