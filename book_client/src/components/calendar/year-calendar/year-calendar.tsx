import { JSX, useState, useMemo, useCallback, CSSProperties } from 'react';
import HeaderCalendar from '../header-calendar/header-calendar';
import Button from 'components/button/button';
import { clsx } from 'utils';
import './style.scss';

type YearCalendar<T> = {
  position: {
    left: number;
    top: number;
  };
  currentYear: number;
  onYearChange: (year: number) => void;
};

const yearsMatrix: Array<number[]> = [
  [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
  [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]
];

function YearCalendar<T>({ position, currentYear, onYearChange }: YearCalendar<T>): JSX.Element {
  const initYears: number[] = yearsMatrix[0].includes(currentYear) ? yearsMatrix[0] : yearsMatrix[1];
  const [years, setYears] = useState<number[]>(initYears);
  const yearRange = useMemo<string>(() => `${years[0]} - ${years[years.length - 1]}`, [years]);

  const positionCalendar: CSSProperties = {
    ...position,
    zIndex: 3000
  };

  const onRangeYearChange = useCallback((index: number): void => {
    setYears(yearsMatrix[index]);
  }, []);

  return (
    <div className="year-calendar" style={positionCalendar}>
      <HeaderCalendar onBackToHead={() => onRangeYearChange(0)} onBackToLast={() => onRangeYearChange(1)}>
        <span className="year-range">{yearRange}</span>
      </HeaderCalendar>
      {
        years.map((year, index) =>
          <Button key={index} onClick={() => onYearChange(year)}
            className={clsx('year-button', { 'current-year': year === currentYear })}>
              {year}
          </Button>
        )
      }
    </div>
  );
}

export default YearCalendar;
