import {
  JSX,
  useCallback,
  useReducer,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
  CSSProperties
} from 'react';
import { createRoot, Root } from 'react-dom/client';
import { daysInWeek } from 'date-fns/constants';
import { required } from 'hooks/useValidate';
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
  setDate,
  setMonth,
  setYear,
} from 'date-fns';
import { clsx } from 'utils';
import Button from 'components/button/button';
import HeaderCalendar from './header-calendar/header-calendar';
import MonthCalendar from './month-calendar/month-calendar';
import YearCalendar from './year-calendar/year-calendar';
import InputCalendar from './input-calendar/input-calendar';
import useForm, { RuleType } from 'hooks/useForm';
import './style.scss';
const calendarHeight: number = 245;
const marginCalendar: number = 10;

type RuleTypeCalendar = RuleType & ArrayLike<RuleType>;

enum CalendarActionType {
  NEXT = 'next',
  PREVIOUS = 'previous',
  LAST = 'last',
  HEAD = 'head',
  MONTH_SELECTED = 'month_selected',
  YEAR_SELECTED = 'year_selected',
};

type Day = {
  day: string;
  active: boolean;
};

type CalendarReducerAction = {
  type: CalendarActionType;
  month?: number;
  year?: number;
};

type CalendarReducerState = {
  weeks: Array<Day[]>,
  month: string;
  year: number;
  date: Date;
};

type DayCalendarProps = {
  selectedDay: Date;
};

const currentDate: Date = new Date();
const firstDayOfWeekIndex: number = 0;
const monthName: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let seletedDate: Date = currentDate;
let selectedYear: number = getYear(currentDate);
let calendarDocker: Root | null = null;
let monthCalendarDocker: Root | null = null;
let yearCalendarDocker: Root | null = null;
const browserHeight: number = window.innerHeight;

const positionCalendar = {
  left: 0,
  top: 0
};

const state = {
  day: currentDate,
};

const rule: RuleType = {
  day: { required }
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

const calendarChange = (state: CalendarReducerState, action: CalendarReducerAction):
  CalendarReducerState => {
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
      case CalendarActionType.MONTH_SELECTED:
        return calculateCalendarInfor(setMonth(state.date, action.month!));
      case CalendarActionType.YEAR_SELECTED:
        return calculateCalendarInfor(setYear(state.date, action.year!));
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
      active: isEqual(startOfDay(seletedDate), day)
    };

    daysWeek.push(day);
  });

  weekArr.push(week);
  return weekArr;
};

const calculateStateReducer = (currentDate: Date): CalendarReducerState => {
  seletedDate = currentDate;
  return {
    weeks: calculateDayToShow(currentDate),
    month: monthName[getMonth(currentDate)],
    year: getYear(currentDate),
    date: currentDate
  };
};

function Calendar(): JSX.Element {
  const inputCalendarRef = useRef<{ rect: DOMRect }>(null);
  const dayCelendarRef = useRef<{ dispatch: React.Dispatch<CalendarReducerAction>, date: Date }>(null);
  const { day } = useForm(state, rule as RuleTypeCalendar, 'form');

  const setDay = useCallback((daySelected: string): void => {
    day.onChange(setDate(dayCelendarRef.current!.date, parseInt(daySelected)));
    calendarDocker?.unmount();
  }, []);

  const setMonthSelected = useCallback((monthIndex: number): void => {
    dayCelendarRef.current!.dispatch({ type: CalendarActionType.MONTH_SELECTED, month: monthIndex });
    monthCalendarDocker?.unmount();
  }, []);

  const setYearSelected = useCallback((year: number): void => {
    selectedYear = year;
    dayCelendarRef.current!.dispatch({ type: CalendarActionType.YEAR_SELECTED, year });
    yearCalendarDocker?.unmount();
    openMonthCalendar();
  }, []);

  const DayCalendar = forwardRef(({ selectedDay }: DayCalendarProps, ref: any): JSX.Element => {
    const [{ month, year, weeks, date }, dispatch] = useReducer(calendarChange, calculateStateReducer(selectedDay));
    const onNext = useCallback(() => dispatch({ type: CalendarActionType.NEXT }), []);
    const onPrevious = useCallback(() => dispatch({ type: CalendarActionType.PREVIOUS }), []);
    const onBackToHead = useCallback(() => dispatch({ type: CalendarActionType.HEAD }), []);
    const onBackToLast = useCallback(() => dispatch({ type: CalendarActionType.LAST }), []);

    useImperativeHandle(ref, () => {
      return {
        dispatch,
        date
      };
    }, [date]);

    const position: CSSProperties = {
      ...positionCalendar,
      zIndex: 1000
    };

    return (
      <ul className="calendar-body" style={position}>
        <li>
          <HeaderCalendar
            onNext={onNext}
            onPrevious={onPrevious}
            onBackToHead={onBackToHead}
            onBackToLast={onBackToLast}>
              <Button onClick={openMonthCalendar} className="header-button">{month}</Button>
              <Button onClick={openYearCalendar} className="header-button">{year}</Button>
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
              {week.map(({day, active}, idx) => (
                <li key={idx}>
                  {day && <Button key={index} className={clsx('day-btn', { 'btn-success': active })} onClick={() => setDay(day)}>
                    {day}
                  </Button>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  });

  const calculateCalendarPosition = (): void => {
    const { bottom, left, height } = inputCalendarRef.current?.rect as DOMRect;
    const spaceCanDock: number = bottom + calendarHeight + (marginCalendar * 2);
    const top: number = spaceCanDock <= browserHeight ? bottom + marginCalendar : bottom - (height + marginCalendar + calendarHeight);
    positionCalendar.left = left;
    positionCalendar.top = top;
  };

  const openYearCalendar = useCallback((): void => {
    yearCalendarDocker = createRoot(document.getElementById('year-calendar-docker')!);
    yearCalendarDocker.render(<YearCalendar currentYear={selectedYear} position={positionCalendar} onYearChange={setYearSelected} />);
  }, [selectedYear]);

  const openDayCalendar = useCallback((): void => {
    calendarDocker = createRoot(document.getElementById('calendar-docker')!);
    calendarDocker.render(<DayCalendar selectedDay={day.value} ref={dayCelendarRef} />);
  }, [day.value]);

  const openMonthCalendar = useCallback((): void => {
    const currentMonthIndex: number = getMonth(dayCelendarRef.current?.date || currentDate);
    monthCalendarDocker = createRoot(document.getElementById('month-calendar-docker')!);
    monthCalendarDocker.render(
      <MonthCalendar
        currentYear={selectedYear}
        currentMonth={currentMonthIndex}
        docker={monthCalendarDocker}
        onMonthChange={setMonthSelected}
        onOpenYearCalendar={openYearCalendar}
        position={positionCalendar} />);
  }, []);

  useEffect(() => {
    calculateCalendarPosition();
  }, []);

  return (
    <section className="calendar-wrapper">
      <InputCalendar {...day} label="Day" name="publish-day" onOpen={openDayCalendar} ref={inputCalendarRef} />
      <div id="calendar-docker" />
      <div id="month-calendar-docker" />
      <div id="year-calendar-docker" />
    </section>
  );
}

export default Calendar;
