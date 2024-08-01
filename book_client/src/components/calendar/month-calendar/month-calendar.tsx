import { CSSProperties, JSX, useCallback, useState } from 'react';
import { Root } from 'react-dom/client';
import HeaderCalendar from '../header-calendar/header-calendar';
import Button from 'components/button/button';
import {
  getYear,
  getMonth,
  addYears,
} from 'date-fns';
import { clsx } from 'utils';
import './style.scss';

const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentDate: Date = new Date();
const currentYear = getYear(currentDate);
let dateUpdated: Date = new Date(currentDate);

type MonthCalendar = {
  position: {
    top: number;
    left: number;
  };
  currentMonth: number;
  docker: Root;
  onOpenYearCalendar: () => void;
  onMonthChange: (month: number) => void;
};

function MonthCalendar({ position, currentMonth, onOpenYearCalendar, onMonthChange }: MonthCalendar): JSX.Element {
  const [year, setYear] = useState<number>(getYear(dateUpdated));

  const positionStyle: CSSProperties = {
    ...position,
    zIndex: 2000
  };

  const setMonth = useCallback((monthIndex: number): void => {
    onMonthChange(monthIndex);
  }, []);

  const onBackToHead = useCallback((): void => {
    dateUpdated = addYears(dateUpdated, -1);
    setYear(getYear(dateUpdated));
  }, []);

  const onBackToLast = useCallback((): void => {
    dateUpdated = addYears(dateUpdated, 1);
    setYear(getYear(dateUpdated));
  }, []);

  return (
    <div className="month-calendar" style={positionStyle}>
      <HeaderCalendar onBackToHead={onBackToHead} onBackToLast={onBackToLast}>
        <Button onClick={onOpenYearCalendar} className="year-btn">{year}</Button>
      </HeaderCalendar>
      {
        months.map((month, index) =>
          <Button key={index} onClick={() => setMonth(index)}
            className={clsx('month-btn', { 'current-month': currentMonth === index && year === currentYear })}>
            {month}
          </Button>
        )
      }
    </div>
  );
}

export default MonthCalendar;
