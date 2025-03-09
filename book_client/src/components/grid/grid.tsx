import { Children, CSSProperties, JSX, ReactNode, useMemo } from 'react';
import './style.scss';
import { clsx } from 'utils';
import { useResponsiveScreenNameSizeContext } from 'contexts/responsive-screen-size';

type ColSize = {
  sm?: number;
  md?: number;
  lg?: number;
};

type GridPropsType = ColSize & {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

type GridItemPropsType = Omit<GridPropsType, 'style'> & {
  order?: number | string;
  style?: {
    lg?: CSSProperties;
    md?: CSSProperties;
    sm?: CSSProperties;
  };
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

export const GridItem = ({ sm, md, lg, order, style, children, className }: GridItemPropsType): JSX.Element => {
  const colClasses: string = createGridColumnClasses({ lg, md, sm });
  const size: string = useResponsiveScreenNameSizeContext();

  const extraStyle = useMemo<CSSProperties>(() => {
    return style ? { ...style[size as keyof typeof style]!, order } : { order };
  }, [style, size]);

  return (
    <div style={extraStyle} className={clsx(colClasses, className)}>
      {children}
    </div>
  );
};

function Grid({ sm, md, lg, style, children, className }: GridPropsType): JSX.Element {
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
