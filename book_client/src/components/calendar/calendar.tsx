import {
  JSX,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { createRoot, Root } from 'react-dom/client';
import { required } from 'hooks/useValidate';
import {
  getMonth,
  getYear,
  setDate,
} from 'date-fns';
import MonthCalendar from './month-calendar/month-calendar';
import YearCalendar from './year-calendar/year-calendar';
import InputCalendar from './input-calendar/input-calendar';
import DayCalendar, { CalendarReducerAction, CalendarActionType } from './day-calendar/day-calendar';
import useForm, { RuleType } from 'hooks/useForm';
import './style.scss';

const calendarHeight: number = 245;
const marginCalendar: number = 10;
const currentDate: Date = new Date();
const browserHeight: number = window.innerHeight;
let selectedYear: number = getYear(currentDate);
let calendarDocker: Root | null = null;
let monthCalendarDocker: Root | null = null;
let yearCalendarDocker: Root | null = null;

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

type RuleTypeCalendar = RuleType & ArrayLike<RuleType>;

function Calendar(): JSX.Element {
  const inputCalendarRef = useRef<{ rect: DOMRect }>(null);
  const dayCalendarRef = useRef<{ dispatch: React.Dispatch<CalendarReducerAction>, date: Date }>(null);
  const { day } = useForm(state, rule as RuleTypeCalendar, 'form');

  const setDay = useCallback((daySelected: string): void => {
    const dateSelected: Date = setDate(dayCalendarRef.current!.date, parseInt(daySelected));
    day.onChange(dateSelected);
    calendarDocker?.unmount();
    selectedYear = getYear(dateSelected);
  }, []);

  const setYear = useCallback((year: number): void => {
    selectedYear = year;
    dayCalendarRef.current!.dispatch({ type: CalendarActionType.YEAR_SELECTED, year });
  }, []);

  const setMonthSelected = useCallback((monthIndex: number): void => {
    dayCalendarRef.current!.dispatch({ type: CalendarActionType.MONTH_SELECTED, month: monthIndex });
    monthCalendarDocker?.unmount();
  }, []);

  const setYearSelected = useCallback((year: number): void => {
    setYear(year);
    yearCalendarDocker?.unmount();
    openMonthCalendar();
  }, []);

  const calculateCalendarPosition = (): void => {
    const { bottom, left, height } = inputCalendarRef.current?.rect as DOMRect;
    const spaceCanDock: number = bottom + calendarHeight + (marginCalendar * 2);
    const top: number = spaceCanDock <= browserHeight ? bottom + marginCalendar : bottom - (height + marginCalendar + calendarHeight);
    positionCalendar.left = left;
    positionCalendar.top = top;
  };

  const openYearCalendar = useCallback((): void => {
    yearCalendarDocker = createRoot(document.getElementById('year-calendar-docker')!);
    yearCalendarDocker.render(
      <YearCalendar
        currentYear={selectedYear}
        position={positionCalendar}
        onYearChange={setYearSelected} />);
  }, [selectedYear]);

  const openDayCalendar = useCallback((): void => {
    calendarDocker = createRoot(document.getElementById('calendar-docker')!);
    calendarDocker.render(
      <DayCalendar
        position={positionCalendar}
        onOpenMonthCalendar={openMonthCalendar}
        onOpenYearCalendar={openYearCalendar}
        onDayChange={setDay}
        selectedDay={day.value}
        ref={dayCalendarRef} />);
  }, [day.value]);

  const openMonthCalendar = useCallback((): void => {
    const currentMonthIndex: number = getMonth(dayCalendarRef.current?.date || currentDate);
    monthCalendarDocker = createRoot(document.getElementById('month-calendar-docker')!);
    monthCalendarDocker.render(
      <MonthCalendar
        currentYear={selectedYear}
        currentMonth={currentMonthIndex}
        docker={monthCalendarDocker}
        onMonthChange={setMonthSelected}
        onOpenYearCalendar={openYearCalendar}
        onYearChange={setYear}
        position={positionCalendar} />);
  }, [day.value]);

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
