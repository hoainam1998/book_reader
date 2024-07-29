import { JSX, useCallback, useState } from 'react';
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
const monthIndex: number = getMonth(currentDate);
const currentYear = getYear(currentDate);
let dateUpdated: Date = new Date(currentDate);

function MonthCalendar(): JSX.Element {
  const [year, setYear] = useState<number>(getYear(dateUpdated));
  const onBackToHead = useCallback(() => {
    dateUpdated = addYears(dateUpdated, -1);
    setYear(getYear(dateUpdated));
  }, []);

  const onBackToLast = useCallback(() => {
    dateUpdated = addYears(dateUpdated, 1);
    setYear(getYear(dateUpdated));
  }, []);

  return (
    <div className="month-calendar">
      <HeaderCalendar onBackToHead={onBackToHead} onBackToLast={onBackToLast}>
        <Button onClick={() => {}} className="year-btn">{year}</Button>
      </HeaderCalendar>
      {
        months.map((month, index) =>
          <Button key={index} onClick={() => {}}
            className={clsx('month-btn', { 'current-month': monthIndex === index && year === currentYear })}>
            {month}
          </Button>
        )
      }
    </div>
  );
}

export default MonthCalendar;
