import { JSX, ReactElement, useRef, useEffect } from 'react';
import { clsx } from 'utils';
import './style.scss';

type TooltipPropsType = {
  children: ReactElement;
  className?: string | object;
};

function Tooltip({ children, className }: TooltipPropsType): JSX.Element {
  const text: string = children.props['data-tooltip'] || children.props.children;
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tooltipRect = tooltipRef.current!.getBoundingClientRect();

    if (tooltipRect.right > window.innerWidth) {
      tooltipRef.current!.style.right = '0px';
    }

    if (tooltipRect.left < 0 ) {
      tooltipRef.current!.style.left = '0px';
    }

    if (tooltipRect.top < 0) {
      tooltipRef.current!.style.top = '0px';
    }

    if (tooltipRect.bottom > window.innerHeight) {
      tooltipRef.current!.style.bottom = '0px';
    }
  }, []);

  return (
    <div className={clsx('tooltip', className)}>
      {children}
      <div className="tooltip-content" ref={tooltipRef}>{text}</div>
    </div>
  );
}

export default Tooltip;
