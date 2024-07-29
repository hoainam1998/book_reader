import { JSX, useCallback, useReducer } from 'react';
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
  addYears
} from 'date-fns';
import { clsx } from 'utils';
import Button from 'components/button/button';
import HeaderCalendar from './header-calendar/header-calendar';
import MonthCalendar from './month-calendar/month-calendar';
import YearCalendar from './year-calendar/year-calendar';
import { daysInWeek } from 'date-fns/constants';
import './style.scss';

enum CalendarActionType {
  NEXT = 'next',
  PREVIOUS = 'previous',
  LAST = 'last',
  HEAD = 'head'
};

type Day = {
  day: string;
  active: boolean;
};

type CalendarReducerAction = {
  type: CalendarActionType;
};

type CalendarReducerState = {
  weeks: Array<Day[]>,
  month: string;
  year: number;
  date: Date;
};

const currentDate: Date = new Date();
const firstDayOfWeekIndex: number = 0;
const monthName: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

const calendarChange = (state: CalendarReducerState, action: CalendarReducerAction): CalendarReducerState => {
  const calculateCalendarInfor = (dateUpdated: Date): CalendarReducerState => {
    return {
      weeks: calculateDayToShow(dateUpdated),
      month: monthName[getMonth(dateUpdated)],
      year: getYear(dateUpdated),
      date: dateUpdated,
    };
  };

  switch(action.type) {
    case CalendarActionType.NEXT:
      return calculateCalendarInfor(addMonths(state.date, 1));
    case CalendarActionType.PREVIOUS:
      return calculateCalendarInfor(addMonths(state.date, -1));
    case CalendarActionType.LAST:
      return calculateCalendarInfor(addYears(state.date, 1));
    case CalendarActionType.HEAD:
      return calculateCalendarInfor(addYears(state.date, -1));
    default: return state;
  }
};

const calculateDayToShow = (dateChanged: Date): Array<Day[]> => {
  const weekArr: Array<Day[]> = [];
    // all day in a month
  const daysWeek: Date[] = [];
  let week: Day[] = initDays();

  eachDayOfInterval({
    start: new Date(dateChanged).setDate(1),
    end: endOfMonth(dateChanged)
  }).forEach(day => {
    const dayWeek = getDay(day);

    if (dayWeek === firstDayOfWeekIndex) {
      weekArr.push(week);
      week = initDays();
    }

    week[dayWeek] = {
      day: format(day, 'dd'),
      active: isEqual(startOfDay(currentDate), day)
    };

    daysWeek.push(day);
  });

  weekArr.push(week);
  return weekArr;
};

function Calendar(): JSX.Element {

  const stateReducer: CalendarReducerState = {
    weeks: calculateDayToShow(currentDate),
    month: monthName[getMonth(currentDate)],
    year: getYear(currentDate),
    date: currentDate
  };

  const [calendar, dispatch] = useReducer(calendarChange, stateReducer);

  const onNext = useCallback(() => dispatch({ type: CalendarActionType.NEXT }), []);
  const onPrevious = useCallback(() => dispatch({ type: CalendarActionType.PREVIOUS }), []);
  const onBackToHead = useCallback(() => dispatch({ type: CalendarActionType.HEAD }), []);
  const onBackToLast = useCallback(() => dispatch({ type: CalendarActionType.LAST }), []);

  return (
    <section style={{ display: 'flex', justifyContent: 'space-between' }}>
    <ul className="calendar-body">
      <li>
        <HeaderCalendar
          onNext={onNext}
          onPrevious={onPrevious}
          onBackToHead={onBackToHead}
          onBackToLast={onBackToLast}>
            <Button onClick={() => {}} className="header-button">{calendar.month}</Button>
            <Button onClick={() => {}} className="header-button">{calendar.year}</Button>
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
      {calendar.weeks.map((week, index) => (
        <li key={index}>
          <ul className="days">
            {week.map(({day, active}, idx) => (
              <li key={idx}>
                {day && <Button key={index} className={clsx('day-btn', { 'btn-success': active })} onClick={() => {}}>
                  {day}
                </Button>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
    <div>
      <MonthCalendar />
    </div>
    <div>
      <YearCalendar />
    </div>
    </section>
  );
}

export default Calendar;
