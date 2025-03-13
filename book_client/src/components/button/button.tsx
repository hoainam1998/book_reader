import { MouseEventHandler, JSX, ReactNode, useMemo } from 'react';
import { clsx } from 'utils';
import './style.scss';

type ButtonPropsType = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
  variant?: 'success' | 'warning' | 'dangerous' | 'primary' | 'submit' | 'outline';
  disabled?: boolean;
};

function Button({
  children,
  className,
  variant,
  onClick,
  disabled
}: ButtonPropsType): JSX.Element {
  const buttonTypeClass: string = useMemo(() => {
    if (variant) {
      if (globalThis.isClient && variant === 'submit') {
        return 'btn-submit-client';
      } else {
        return variant;
      }
    }
    return '';
  }, [variant]);

  return (
    <button
      className={clsx('button', className, buttonTypeClass)}
      onClick={onClick}
      disabled={disabled}>
        {children}
    </button>
  );
}

export default Button;
