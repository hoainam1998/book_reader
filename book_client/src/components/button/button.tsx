import { MouseEventHandler, JSX, ReactNode, useMemo } from 'react';
import { clsx } from 'utils';
import './style.scss';

type ButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
  variant?: 'success' | 'warning' | 'dangerous' | 'primary' | 'submit';
  disabled?: boolean;
};

function Button({
  children,
  className,
  variant,
  onClick,
  disabled
}: ButtonProps): JSX.Element {
  const buttonTypeClass: string = useMemo(() => {
    if (variant) {
      return `btn-${variant}`;
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
