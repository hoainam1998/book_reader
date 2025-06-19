import { MouseEventHandler, JSX, ReactNode, useMemo, useRef, forwardRef, useImperativeHandle, Ref } from 'react';
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
  disabled,
  onClick,
}: ButtonPropsType, ref: Ref<HTMLElement>): JSX.Element {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const buttonTypeClass: string = useMemo<string>(() => {
    if (variant) {
      if (globalThis.isClient && variant === 'submit') {
        return 'btn-submit-client';
      } else {
        return `btn-${variant}`;
      }
    }
    return '';
  }, [variant]);

  useImperativeHandle(
    ref,
    (): HTMLElement => buttonRef.current!,
    []
  );

  return (
    <button
      className={clsx('button', className, buttonTypeClass)}
      onClick={onClick}
      disabled={disabled}
      ref={buttonRef}>
        {children}
    </button>
  );
}

export default forwardRef(Button);
