/* eslint-disable no-unused-vars */
import { CSSProperties, JSX, useCallback, useReducer } from 'react';
import { Root } from 'react-dom/client';
import HeaderCalendar from '../header-calendar/header-calendar';
import Button from 'components/button/button';;
import { clsx } from 'utils';
import useUpdatePositionAcrossWindowSize from 'hooks/useUpdatePositionAcrossWindowSize';
import './style.scss';

const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const miniYear: number = 2010;
const maximumYear: number = 2029;

enum YearChangedReducerAction {
  LAST = 'last',
  HEAD = 'head',
};

type MonthCalendarPropsType = {
  currentMonth: number;
  currentYear: number;
  docker: Root;
  onOpenYearCalendar: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onPositionChange: () => CSSProperties;
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
  currentMonth,
  currentYear,
  onOpenYearCalendar,
  onMonthChange,
  onYearChange,
  onPositionChange,
}: MonthCalendarPropsType): JSX.Element {
  const [year, dispatch] = useReducer(yearChangedReducer(onYearChange), currentYear);

  const onBackToHead = useCallback((): void => {
    dispatch({ type: YearChangedReducerAction.HEAD });
  }, []);

  const onBackToLast = useCallback((): void => {
    dispatch({ type: YearChangedReducerAction.LAST });
  }, []);

  const position = useUpdatePositionAcrossWindowSize(onPositionChange);
  if (!Object.keys(position).length) {
    return <></>;
  }

  return (
    <div className="month-calendar" style={{ ...position, zIndex: 2000 }}>
      <HeaderCalendar onBackToHead={onBackToHead} onBackToLast={onBackToLast}>
        <Button onClick={onOpenYearCalendar} className="year-btn">{ year }</Button>
      </HeaderCalendar>
      {
        months.map((month, index) =>
          <Button key={index} onClick={() => onMonthChange(index)}
            className={clsx('month-btn', { 'current-month': currentMonth === index && year === currentYear })}>
            { month }
          </Button>
        )
      }
    </div>
  );
}

export default MonthCalendar;
