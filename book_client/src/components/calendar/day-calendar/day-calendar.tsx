declare module 'react' {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => JSX.Element
  ): (props: P & React.RefAttributes<T>) => JSX.Element;
};

import {
  useImperativeHandle,
  forwardRef,
  useReducer,
  useCallback,
  CSSProperties,
  Dispatch,
  Ref
} from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  getDay,
  format,
  isEqual,
  startOfDay,
  getMonth,
  getYear,
  addMonths,
  addYears,
  setMonth,
  setYear
} from 'date-fns';
import { clsx } from 'utils';
import { daysInWeek } from 'date-fns/constants';
import HeaderCalendar from '../header-calendar/header-calendar';
import Button from 'components/button/button';
import './style.scss';

const firstDayOfWeekIndex: number = 0;
const currentDate: Date = new Date();
const monthName: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
let selectedDate: Date = currentDate;

export enum CalendarActionType {
  NEXT = 'next',
  PREVIOUS = 'previous',
  LAST = 'last',
  HEAD = 'head',
  MONTH_SELECTED = 'month_selected',
  YEAR_SELECTED = 'year_selected'
};

type DayCalendarRef = {
  dispatch: Dispatch<CalendarReducerAction>,
  date: Date;
};

type DayCalendarProps<T> = {
  selectedDay: number | null;
  position: T;
  onOpenMonthCalendar: () => void;
  onOpenYearCalendar: () => void;
  onDayChange: (day: string) => void;
};

type Day = {
  day: string;
  active: boolean;
};

export type CalendarReducerAction = {
  type: CalendarActionType;
  month?: number;
  year?: number;
};

type CalendarReducerState = {
  weeks: Array<Day[]>;
  month: string;
  year: number;
  date: Date;
};

const initDays = (): Day[] => {
  const dayArr: Day[] = [];
  for (let i = 0; i <= daysInWeek - 1; i++) {
    dayArr.push({
      day: '',
      active: false
    });
  }
  return dayArr;
};

const calculateStateReducer = (currentDate: Date): CalendarReducerState => {
  selectedDate = currentDate;
  return {
    weeks: calculateDayToShow(currentDate),
    month: monthName[getMonth(currentDate)],
    year: getYear(currentDate),
    date: currentDate
  };
};

const calculateDayToShow = (dateChanged: Date): Array<Day[]> => {
  const weekArr: Array<Day[]> = [];
  // all day in a month
  const daysWeek: Date[] = [];
  let week: Day[] = initDays();

  eachDayOfInterval({
    start: new Date(dateChanged).setDate(1),
    end: endOfMonth(dateChanged)
  }).forEach((day) => {
    const dayWeek = getDay(day);

    if (dayWeek === firstDayOfWeekIndex) {
      weekArr.push(week);
      week = initDays();
    }

    week[dayWeek] = {
      day: format(day, 'dd'),
      active: isEqual(startOfDay(selectedDate), day)
    };

    daysWeek.push(day);
  });

  weekArr.push(week);
  return weekArr;
};

const calendarChange = (
  state: CalendarReducerState,
  action: CalendarReducerAction
): CalendarReducerState => {
  const calculateCalendarInfo = (dateUpdated: Date): CalendarReducerState => {
    return {
      weeks: calculateDayToShow(dateUpdated),
      month: monthName[getMonth(dateUpdated)],
      year: getYear(dateUpdated),
      date: dateUpdated
    };
  };

  switch (action.type) {
    case CalendarActionType.NEXT:
      return calculateCalendarInfo(addMonths(state.date, 1));
    case CalendarActionType.PREVIOUS:
      return calculateCalendarInfo(addMonths(state.date, -1));
    case CalendarActionType.LAST:
      return calculateCalendarInfo(addYears(state.date, 1));
    case CalendarActionType.HEAD:
      return calculateCalendarInfo(addYears(state.date, -1));
    case CalendarActionType.MONTH_SELECTED:
      return calculateCalendarInfo(setMonth(state.date, action.month!));
    case CalendarActionType.YEAR_SELECTED:
      return calculateCalendarInfo(setYear(state.date, action.year!));
    default:
      return state;
  }
};

function DayCalendar<T>(
  { selectedDay, position, onOpenMonthCalendar, onOpenYearCalendar, onDayChange }: DayCalendarProps<T>,
  ref: Ref<DayCalendarRef>
): JSX.Element {
  const [{ month, year, weeks, date }, dispatch] = useReducer(
    calendarChange,
    calculateStateReducer(new Date(selectedDay || currentDate))
  );
  const onNext = useCallback((): void => dispatch({ type: CalendarActionType.NEXT }), []);
  const onPrevious = useCallback((): void => dispatch({ type: CalendarActionType.PREVIOUS }), []);
  const onBackToHead = useCallback((): void => dispatch({ type: CalendarActionType.HEAD }), []);
  const onBackToLast = useCallback((): void => dispatch({ type: CalendarActionType.LAST }), []);

  useImperativeHandle(
    ref,
    (): DayCalendarRef => ({ dispatch, date }),
    [date]
  );

  const positionCalendar: CSSProperties = {
    ...position,
    zIndex: 1000
  };

  return (
    <ul className="calendar-body" style={positionCalendar}>
      <li>
        <HeaderCalendar
          onNext={onNext}
          onPrevious={onPrevious}
          onBackToHead={onBackToHead}
          onBackToLast={onBackToLast}>
          <Button onClick={onOpenMonthCalendar} className="header-button">
            {month}
          </Button>
          <Button onClick={onOpenYearCalendar} className="header-button">
            {year}
          </Button>
        </HeaderCalendar>
      </li>
      <li>
        <ul className="day-name">
          <li>Sun</li>
          <li>Mon</li>
          <li>Tue</li>
          <li>Wed</li>
          <li>Thu</li>
          <li>Fri</li>
          <li>Sat</li>
        </ul>
      </li>
      {weeks.map((week, index) => (
        <li key={index}>
          <ul className="days">
            {week.map(({ day, active }, idx) => (
              <li key={idx}>
                {day && (
                  <Button
                    key={index}
                    className={clsx('day-btn', { 'btn-success': active })}
                    onClick={() => onDayChange(day)}>
                    {day}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default forwardRef(DayCalendar);
