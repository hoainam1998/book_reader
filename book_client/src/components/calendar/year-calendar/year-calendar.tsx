import { JSX, useState, useMemo, useCallback, CSSProperties } from 'react';
import HeaderCalendar from '../header-calendar/header-calendar';
import Button from 'components/button/button';
import useUpdatePositionAcrossWindowSize from 'hooks/useUpdatePositionAcrossWindowSize';
import { clsx } from 'utils';
import './style.scss';

type YearCalendarPropsType = {
  currentYear: number;
  // eslint-disable-next-line no-unused-vars
  onYearChange: (year: number) => void;
  onPositionChange: () => CSSProperties;
};

const yearsMatrix: Array<number[]> = [
  [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
  [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]
];

function YearCalendar({ currentYear, onYearChange, onPositionChange }: YearCalendarPropsType): JSX.Element {
  const initYears: number[] = yearsMatrix[0].includes(currentYear) ? yearsMatrix[0] : yearsMatrix[1];
  const [years, setYears] = useState<number[]>(initYears);
  const yearRange = useMemo<string>(() => `${years[0]} - ${years[years.length - 1]}`, [years]);

  const onRangeYearChange = useCallback((index: number): void => {
    setYears(yearsMatrix[index]);
  }, []);

  const position = useUpdatePositionAcrossWindowSize(onPositionChange);
  if (!Object.keys(position).length) {
    return <></>;
  }

  return (
    <div className="year-calendar" style={{ ...position, zIndex: 3000 }}>
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
