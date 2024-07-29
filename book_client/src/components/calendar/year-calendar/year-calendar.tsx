import { JSX, useState, useMemo, useCallback } from 'react';
import { getYear } from 'date-fns';
import HeaderCalendar from '../header-calendar/header-calendar';
import Button from 'components/button/button';
import { clsx } from 'utils';
import './style.scss';

type YearCalendar = {};

const yearsMatrix: Array<number[]> = [
  [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
  [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]
];

function YearCalendar(): JSX.Element {
  const currentYear: number = getYear(new Date());
  const initYears: number[] = yearsMatrix[0].includes(currentYear) ? yearsMatrix[0] : yearsMatrix[1];
  const [years, setYears] = useState(initYears);
  const yearRange = useMemo(() => `${years[0]} - ${years[years.length - 1]}`, [years]);

  const onRangeYearChange = useCallback((index: number): void => {
    setYears(yearsMatrix[index]);
  }, []);

  return (
    <div className="year-calendar">
      <HeaderCalendar onBackToHead={() => onRangeYearChange(0)} onBackToLast={() => onRangeYearChange(1)}>
        <Button onClick={() => {}} className="year-selected">{yearRange}</Button>
      </HeaderCalendar>
      {
        years.map((year, index) =>
          <Button key={index} onClick={() => {}}
            className={clsx('year-button', { 'current-year': year === currentYear })}>
              {year}
          </Button>
        )
      }
    </div>
  );
}

export default YearCalendar;
