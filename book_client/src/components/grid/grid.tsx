import { Children, CSSProperties, JSX, ReactNode } from 'react';
import './style.scss';
import { clsx } from 'utils';

type ColSize = {
  sm?: number;
  md?: number;
  lg?: number;
};

type GridProps = ColSize & {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Return class text for grid.
 *
 * @param {ColSize} colObject - object contain information about col size (ex: sm, md, lg).
 * @param {string} [classProperty=''] - property name (ex: row or col).
 * @returns {string} - class text.
 */
const createGridColumnClasses = (colObject: ColSize, classProperty: string = ''): string => {
  return Object.keys(colObject).reduce((classes: string, key: string) => {
    const value: number = colObject[key as keyof ColSize]!;
    const prefixClass: string = classProperty ? `col-${classProperty}-` : 'col-';

    if (value) {
      classes += (key === 'lg' ? `${prefixClass}${value}` : `${prefixClass}${key}-${value}`).concat(' ');
    }

    return classes;
  }, '').trim();
};

export const GridItem = ({ sm, md, lg, children, className }: GridProps ): JSX.Element => {
  const colClasses: string = createGridColumnClasses({ lg, md, sm });
  return (
    <div className={clsx(colClasses, className)}>{children}</div>
  );
};

function Grid({ sm, md, lg, style, children, className }: GridProps): JSX.Element {
  let rowClasses: string = createGridColumnClasses({ lg, md, sm }, 'row');

  const childrenCount = Children.count(children);
  if (!rowClasses && childrenCount > 0) {
    rowClasses = `col-row-${childrenCount}`;
  }

  return (
    <section className={clsx('grid', rowClasses, className)} style={style}>
      {children}
    </section>
  );
}

export default Grid;
