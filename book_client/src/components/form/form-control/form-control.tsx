import { JSX, ReactElement, forwardRef, useRef, useImperativeHandle, useMemo, Ref, ReactNode } from 'react';
import { GridItem } from 'components/grid/grid';
import { clsx } from 'utils';
import './style.scss';

type ColumnSize = {
  md?: number;
  sm?: number;
  lg?: number;
};

export type FormControlProps = {
  children?: ReactElement;
  name: string;
  label?: ReactNode;
  className?: string;
  labelClass?: string;
  errors?: string[];
  labelColumnSize?: ColumnSize,
  inputColumnSize?: ColumnSize
};

function FormControl<T>({
  label,
  name,
  children,
  errors = [],
  className,
  labelClass,
  labelColumnSize,
  inputColumnSize
}: FormControlProps, ref: Ref<T>): JSX.Element {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);

  useImperativeHandle(
    ref,
    (): T => ({ rect: fieldsetRef.current!.getBoundingClientRect() }) as T,
    []
  );

  const inputColumn: ColumnSize = useMemo(() => {
    if (!label && inputColumnSize) {
      Object.keys(inputColumnSize)
        .forEach((key: string) => {inputColumnSize[key as keyof ColumnSize] = 12; });
    }
    return inputColumnSize || {};
  }, [inputColumnSize, label]);

  return (
    <fieldset className={clsx('fieldset grid', className)} ref={fieldsetRef}>
      { label &&
        <GridItem {...labelColumnSize} >
          <label htmlFor={name} className={labelClass}>{ label }</label>
        </GridItem>
      }
      <GridItem {...inputColumn}>
        {children}
      </GridItem>
      <GridItem lg={12} className="error-feedback">
        { errors.map((error, index) => <span key={index}>{ error }</span>) }
      </GridItem>
    </fieldset>
  );
}

export default forwardRef(FormControl);
