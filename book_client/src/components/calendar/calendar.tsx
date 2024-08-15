import {
  JSX,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  getMonth,
  getYear,
  setDate
} from 'date-fns';
import MonthCalendar from './month-calendar/month-calendar';
import YearCalendar from './year-calendar/year-calendar';
import InputCalendar from './input-calendar/input-calendar';
import DayCalendar, { CalendarReducerAction, CalendarActionType } from './day-calendar/day-calendar';
import { FieldValidateProps } from 'hooks/useForm';
import './style.scss';

const calendarHeight: number = 245;
const marginCalendar: number = 10;
const currentDate: Date = new Date();
const browserHeight: number = window.innerHeight;
let selectedYear: number = getYear(currentDate);
let calendarDocker: Root | null = null;
let monthCalendarDocker: Root | null = null;
let yearCalendarDocker: Root | null = null;
let monthCalendarShowed: boolean = false;

type PositionType = {
  left: number;
  top: number;
};

const positionCalendar: PositionType = {
  left: 0,
  top: 0
};

const state = {
  day: currentDate.getTime(),
};

type CalendarPropsType = {
  label: string;
  name: string;
  labelClass: string;
  inputClass?: string;
} & FieldValidateProps<number | null>;

function Calendar({
  value,
  label,
  name,
  errors,
  error,
  labelClass,
  inputClass,
  onChange,
  onFocus
  }: CalendarPropsType): JSX.Element {
  const inputCalendarRef = useRef<{ rect: DOMRect }>(null);
  const dayCalendarRef = useRef<{ dispatch: React.Dispatch<CalendarReducerAction>, date: Date }>(null);

  if (value) {
    state.day = value;
  }

  const setDay = useCallback((daySelected: string): void => {
    const dateSelected: Date = setDate(dayCalendarRef.current!.date, parseInt(daySelected));
    onChange(dateSelected.getTime());
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
    monthCalendarShowed = false;
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
      <YearCalendar<PositionType>
        currentYear={selectedYear}
        position={positionCalendar}
        onYearChange={setYearSelected} />);
  }, [selectedYear]);

  const openDayCalendar = useCallback((): void => {
    calendarDocker = createRoot(document.getElementById('calendar-docker')!);
    calendarDocker.render(
      <DayCalendar<PositionType>
        position={positionCalendar}
        onOpenMonthCalendar={openMonthCalendar}
        onOpenYearCalendar={openYearCalendar}
        onDayChange={setDay}
        selectedDay={value}
        ref={dayCalendarRef} />);
  }, [value]);

  const openMonthCalendar = useCallback((): void => {
    if (!monthCalendarShowed) {
      const currentMonthIndex: number = getMonth(dayCalendarRef.current?.date || currentDate);
      monthCalendarDocker = createRoot(document.getElementById('month-calendar-docker')!);
      monthCalendarDocker.render(
        <MonthCalendar<PositionType>
          currentYear={selectedYear}
          currentMonth={currentMonthIndex}
          docker={monthCalendarDocker}
          onMonthChange={setMonthSelected}
          onOpenYearCalendar={openYearCalendar}
          onYearChange={setYear}
          position={positionCalendar} />);
      monthCalendarShowed = true;
    }
  }, [value]);

  useEffect(() => {
    calculateCalendarPosition();
  }, []);

  return (
    <section className="calendar-wrapper">
      <InputCalendar
        name={name}
        error={error}
        errors={errors}
        value={value}
        label={label}
        labelClass={labelClass}
        inputClass={inputClass}
        onOpen={openDayCalendar}
        onFocus={onFocus}
        ref={inputCalendarRef} />
      <div id="calendar-docker" />
      <div id="month-calendar-docker" />
      <div id="year-calendar-docker" />
    </section>
  );
}

export default Calendar;
