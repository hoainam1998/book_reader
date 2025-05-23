import { JSX, ReactElement } from 'react';
import Button from 'components/button/button';
import './style.scss';

type HeaderCalendarPropsType = {
  onNext?: () => void;
  onPrevious?: () => void;
  onBackToLast: () => void;
  onBackToHead: () => void;
  children: ReactElement[] | ReactElement;
};

function HeaderCalendar({
  onNext,
  onPrevious,
  onBackToLast,
  onBackToHead,
  children
}: HeaderCalendarPropsType): JSX.Element {
  return (
    <div className="header-calendar">
      <Button onClick={onBackToHead} className="header-button icon-arrow">&#11120;</Button>
      { onPrevious && <Button onClick={onPrevious} className="header-button icon-arrow">&#11104;</Button> }
      {children}
      { onNext && <Button onClick={onNext} className="header-button icon-arrow">&#11106;</Button> }
      <Button onClick={onBackToLast} className="header-button icon-arrow">&#11122;</Button>
    </div>
  );
}

export default HeaderCalendar;
