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
  Ref,
  MouseEventHandler
} from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  getDay,
  format,
  isEqual,
  compareAsc,
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
  YEAR_SELECTED = 'year_selected',
  DISABLED_DAY = 'disabled_day',
};

export enum DisableDayActionEnum {
  AFTER = 'after',
  BEFORE = 'before',
  EQUAL = 'equal',
  AFTER_OR_EQUAL = 'after_or_equal',
  BEFORE_OR_EQUAL = 'before_or_equal',
};

export type CalendarReducerAction = {
  type: CalendarActionType;
  month?: number;
  year?: number;
};

type DayCalendarRef = {
  dispatch: Dispatch<CalendarReducerAction>,
  date: Date;
};

type DayCalendarProps<T> = {
  selectedDay: number | null;
  position: T;
  disable?: {
    day: Date | number;
    action: DisableDayActionEnum;
  };
  onOpenMonthCalendar: () => void;
  onOpenYearCalendar: () => void;
  onDayChange: (day: string) => void;
};

type Day = {
  day: string;
  active: boolean;
  disabled?: boolean;
};

type CalendarReducerState = {
  weeks: Array<Day[]>;
  month: string;
  year: number;
  date: Date;
};

type DisableDayFn = (day: Date | number) => boolean;

const initDays = (): Day[] => {
  const dayArr: Day[] = [];
  for (let i = 0; i <= daysInWeek - 1; i++) {
    dayArr.push({
      day: '',
      active: false,
      disabled: true
    });
  }
  return dayArr;
};

const calculateStateReducer = (currentDate: Date, disableDayFn?: DisableDayFn): CalendarReducerState => {
  selectedDate = currentDate;
  return {
    weeks: calculateDayToShow(currentDate, disableDayFn),
    month: monthName[getMonth(currentDate)],
    year: getYear(currentDate),
    date: currentDate
  };
};

const calculateDayToShow = (dateChanged: Date, disableDayFn?: DisableDayFn): Array<Day[]> => {
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
      active: isEqual(startOfDay(selectedDate), day),
      disabled: disableDayFn ? disableDayFn(day) : false,
    };

    daysWeek.push(day);
  });

  weekArr.push(week);
  return weekArr;
};

const dayCalendarReduceExecute = (disableDay: DisableDayFn) =>  (
  state: CalendarReducerState,
  action: CalendarReducerAction
): CalendarReducerState => {
  const calculateCalendarInfo = (dateUpdated: Date): CalendarReducerState => {
    return {
      weeks: calculateDayToShow(dateUpdated, disableDay),
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
  { selectedDay, position, disable, onOpenMonthCalendar, onOpenYearCalendar, onDayChange }: DayCalendarProps<T>,
  ref: Ref<DayCalendarRef>
): JSX.Element {
  const disabledDay: DisableDayFn = (day) => {
    if (disable) {
      const resultCompareDay: number = compareAsc(day, startOfDay(disable.day));
      switch(disable.action) {
        case DisableDayActionEnum.AFTER:
          return resultCompareDay > 0;
        case DisableDayActionEnum.BEFORE:
          return resultCompareDay < 0;
        case DisableDayActionEnum.AFTER_OR_EQUAL:
          return resultCompareDay >= 0;
        case DisableDayActionEnum.BEFORE_OR_EQUAL:
          return resultCompareDay <= 0;
        default:
          return resultCompareDay === 0;
      }
    }
    return false;
  };

  const [{ month, year, weeks, date }, dispatch] = useReducer(
    dayCalendarReduceExecute(disabledDay),
    calculateStateReducer(new Date(selectedDay || currentDate), disabledDay)
  );

  const onNext = useCallback((): void => dispatch({ type: CalendarActionType.NEXT }), []);
  const onPrevious = useCallback((): void => dispatch({ type: CalendarActionType.PREVIOUS }), []);
  const onBackToHead = useCallback((): void => dispatch({ type: CalendarActionType.HEAD }), []);
  const onBackToLast = useCallback((): void => dispatch({ type: CalendarActionType.LAST }), []);

  const openMonthCalendar: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    event.preventDefault();
    onOpenMonthCalendar();
  }, []);

  const openYearCalendar: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    event.preventDefault();
    onOpenYearCalendar();
  }, []);

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
          <Button onClick={openMonthCalendar} className="header-button">
            {month}
          </Button>
          <Button onClick={openYearCalendar} className="header-button">
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
            {week.map(({ day, active, disabled }, idx) => (
              <li key={idx}>
                {day && (
                  <Button
                    key={index}
                    disabled={disabled}
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
