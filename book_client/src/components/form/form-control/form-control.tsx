import {
  JSX,
  ReactElement,
  forwardRef,
  useRef,
  useMemo,
  Ref,
  ReactNode,
  useImperativeHandle,
  CSSProperties,
  Fragment,
} from 'react';
import { GridItem } from 'components/grid/grid';
import { clsx } from 'utils';
import './style.scss';

type ColumnSize = {
  md?: number;
  sm?: number;
  lg?: number;
};

export type OptionPrototype<T> = {
  class?: string;
  value?: T ;
  label?: string;
  disabled?: boolean;
};

export type FormControlProps = {
  children?: ReactElement;
  name: string;
  label?: ReactNode;
  options?: OptionPrototype<unknown>[]
  className?: string;
  labelClass?: string;
  labelStyle?: CSSProperties;
  errors?: string[];
  labelColumnSize?: ColumnSize,
  inputColumnSize?: ColumnSize,
};

function FormControl({
  label,
  name,
  children,
  errors = [],
  className,
  labelClass,
  labelStyle,
  labelColumnSize,
  inputColumnSize,
}: FormControlProps, ref: Ref<HTMLElement>): JSX.Element {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  useImperativeHandle(
    ref,
    (): HTMLElement => fieldsetRef.current!,
    []
  );

  const inputColumn: ColumnSize = useMemo<ColumnSize>(() => {
    if (!label && inputColumnSize) {
      Object.keys(inputColumnSize).forEach((key: string) => {
        inputColumnSize[key as keyof ColumnSize] = 12;
      });
    }
    return inputColumnSize || { lg: 8 };
  }, [inputColumnSize, label]);

  return (
    <fieldset className={clsx('fieldset grid', className)} ref={fieldsetRef}>
      { label &&
        <GridItem {...labelColumnSize} >
          <label htmlFor={name} style={labelStyle} className={labelClass}>{label}</label>
        </GridItem>
      }
      <GridItem {...inputColumn}>
        {children}
      </GridItem>
      <GridItem lg={12} className="error-feedback">
        { errors.map((error, index) => (
          <Fragment key={index}>
            <span>{error}</span>
            <br/>
          </Fragment>
        )) }
      </GridItem>
    </fieldset>
  );
}

export default forwardRef(FormControl);
