import { CSSProperties, JSX, useCallback, useState, useReducer } from 'react';
import { Root } from 'react-dom/client';
import HeaderCalendar from '../header-calendar/header-calendar';
import Button from 'components/button/button';;
import { clsx } from 'utils';
import './style.scss';

const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const miniYear: number = 2010;
const maximumYear: number = 2029;

enum YearChangedReducerAction {
  LAST = 'last',
  HEAD = 'head',
};

type MonthCalendar = {
  position: {
    top: number;
    left: number;
  };
  currentMonth: number;
  currentYear: number;
  docker: Root;
  onOpenYearCalendar: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
};


type YearChangedReducerActionType = {
  type: string;
};

const yearChangedReducer =
  (onYearChange: (year: number) => void) =>
    (state: number, action: YearChangedReducerActionType): number => {
  switch (action.type) {
    case YearChangedReducerAction.HEAD:
      if (state > miniYear) {
        onYearChange(state - 1);
        return state - 1;
      }
      return state;
    case YearChangedReducerAction.LAST:
      if (state < maximumYear) {
        onYearChange(state + 1);
        return state + 1;
      }
      return state;
    default:
      return state;
  }
};

function MonthCalendar({
  position,
  currentMonth,
  currentYear,
  onOpenYearCalendar,
  onMonthChange,
  onYearChange
}: MonthCalendar): JSX.Element {
  const [year, dispatch] = useReducer(yearChangedReducer(onYearChange), currentYear);

  const positionStyle: CSSProperties = {
    ...position,
    zIndex: 2000
  };

  const onBackToHead = useCallback((): void => {
    dispatch({ type: YearChangedReducerAction.HEAD });
  }, []);

  const onBackToLast = useCallback((): void => {
    dispatch({ type: YearChangedReducerAction.LAST });
  }, []);

  return (
    <div className="month-calendar" style={positionStyle}>
      <HeaderCalendar onBackToHead={onBackToHead} onBackToLast={onBackToLast}>
        <Button onClick={onOpenYearCalendar} className="year-btn">{year}</Button>
      </HeaderCalendar>
      {
        months.map((month, index) =>
          <Button key={index} onClick={() => onMonthChange(index)}
            className={clsx('month-btn', { 'current-month': currentMonth === index && year === currentYear })}>
            {month}
          </Button>
        )
      }
    </div>
  );
}

export default MonthCalendar;
