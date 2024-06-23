import { MouseEventHandler } from 'react';
import { clsx } from 'utils';
import './style.scss';

type ButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
};

function Button({ children, className, onClick }: ButtonProps): JSX.Element {
  return (
    <button className={clsx('button', className)} onClick={onClick}>{children}</button>
  );
}

export default Button;
