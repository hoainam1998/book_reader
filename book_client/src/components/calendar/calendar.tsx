/* eslint-disable no-use-before-define */
import {
  JSX,
  useCallback,
  useEffect,
  useRef,
  Dispatch
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
import { FormControlProps } from 'components/form/form-control/form-control';
import
DayCalendar,
{
  CalendarReducerAction,
  CalendarActionType,
  DisableDayActionEnum
} from './day-calendar/day-calendar';
import { FieldValidateProps } from 'hooks/useForm';
import { createElementWrapper } from 'utils';
import './style.scss';

const bodyDOM: HTMLElement = document.body;
const monthCalendarDockerDOM = createElementWrapper('month-calendar-docker');
const calendarDockerDOM = createElementWrapper('calendar-docker');
const yearCalendarDockerDOM = createElementWrapper('year-calendar-docker');

const calendarHeight: number = 245;
const marginCalendar: number = 10;
const currentDate: Date = new Date();
const browserHeight: number = window.innerHeight;
let selectedYear: number = getYear(currentDate);
let calendarDocker: Root | null = null;
let monthCalendarDocker: Root | null = null;
let yearCalendarDocker: Root | null = null;

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
  inputClass?: string;
} & FieldValidateProps<number | null>
& Omit<FormControlProps, 'children'>;

function Calendar({
  value,
  label,
  name,
  errors,
  error,
  labelClass,
  inputClass,
  inputColumnSize,
  labelColumnSize,
  onChange,
  onFocus
  }: CalendarPropsType): JSX.Element {
  const inputCalendarRef = useRef<{ rect: DOMRect }>(null);
  const dayCalendarRef = useRef<{ dispatch: Dispatch<CalendarReducerAction>, date: Date }>(null);

  const setDay = useCallback((daySelected: string): void => {
    const dateSelected: Date = setDate(dayCalendarRef.current!.date, parseInt(daySelected));
    onChange(dateSelected.getTime());
    calendarDocker?.unmount();
    calendarDockerDOM.remove();
    selectedYear = getYear(dateSelected);
  }, []);

  const setYear = useCallback((year: number): void => {
    selectedYear = year;
    dayCalendarRef.current!.dispatch({ type: CalendarActionType.YEAR_SELECTED, year });
  }, []);

  const setMonthSelected = useCallback((monthIndex: number): void => {
    dayCalendarRef.current!.dispatch({ type: CalendarActionType.MONTH_SELECTED, month: monthIndex });
    monthCalendarDocker?.unmount();
    monthCalendarDockerDOM.remove();
  }, []);

  const setYearSelected = useCallback((year: number): void => {
    setYear(year);
    yearCalendarDocker?.unmount();
    yearCalendarDockerDOM.remove();
    openMonthCalendar();
  }, []);

  const calculateCalendarPosition = useCallback((): void => {
    const { bottom, left, height } = inputCalendarRef.current?.rect as DOMRect;
    const spaceCanDock: number = bottom + calendarHeight + (marginCalendar * 2);
    const top: number =
    spaceCanDock <= browserHeight
    ? bottom + marginCalendar
    : bottom - (height + marginCalendar + calendarHeight);
    positionCalendar.left = left;
    positionCalendar.top = top;
  }, [inputCalendarRef.current]);

  const openYearCalendar = useCallback((): void => {
    if (!bodyDOM.contains(yearCalendarDockerDOM)) {
      bodyDOM.appendChild(yearCalendarDockerDOM);
      yearCalendarDocker = createRoot(yearCalendarDockerDOM);
      yearCalendarDocker.render(
        <YearCalendar<PositionType>
          currentYear={selectedYear}
          position={positionCalendar}
          onYearChange={setYearSelected} />
      );
    }
  }, [selectedYear]);

  const openDayCalendar = useCallback((): void => {
    if (!bodyDOM.contains(calendarDockerDOM)) {
      bodyDOM.appendChild(calendarDockerDOM);
      calendarDocker = createRoot(calendarDockerDOM);
      calendarDocker.render(
        <DayCalendar<PositionType>
          position={positionCalendar}
          onOpenMonthCalendar={openMonthCalendar}
          onOpenYearCalendar={openYearCalendar}
          onDayChange={setDay}
          selectedDay={value}
          disable={
            {
              action: DisableDayActionEnum.AFTER_OR_EQUAL,
              day: Date.now()
            }
          }
          ref={dayCalendarRef} />
      );
    }
  }, [value]);

  const openMonthCalendar = useCallback((): void => {
    if (!bodyDOM.contains(monthCalendarDockerDOM)) {
      const currentMonthIndex: number = getMonth(dayCalendarRef.current?.date || currentDate);
      bodyDOM.appendChild(monthCalendarDockerDOM);
      monthCalendarDocker = createRoot(monthCalendarDockerDOM);
      monthCalendarDocker.render(
        <MonthCalendar<PositionType>
          currentYear={selectedYear}
          currentMonth={currentMonthIndex}
          docker={monthCalendarDocker}
          onMonthChange={setMonthSelected}
          onOpenYearCalendar={openYearCalendar}
          onYearChange={setYear}
          position={positionCalendar} />
      );
    }
  }, [value]);

  useEffect(() => {
    if (value) {
      state.day = value;
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
        inputColumnSize={inputColumnSize}
        labelColumnSize={labelColumnSize}
        onOpen={openDayCalendar}
        onFocus={onFocus}
        ref={inputCalendarRef} />
    </section>
  );
}

export default Calendar;
