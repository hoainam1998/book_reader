import { MouseEventHandler, JSX, ReactNode } from 'react';
import { clsx } from 'utils';
import './style.scss';

type ButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
};

function Button({ children, className, onClick, disabled }: ButtonProps): JSX.Element {
  return (
    <button className={clsx('button', className)} onClick={onClick} disabled={disabled}>{children}</button>
  );
}

export default Button;
