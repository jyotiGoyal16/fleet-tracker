import type { MouseEventHandler, ReactNode } from 'react';

interface ButtonProps {
  children?: ReactNode;
  variant?: 'primary' | 'icon-only';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button = (props: ButtonProps) => {
  const {
    variant = 'primary',
    type = 'button',
    className = '',
    children,
    disabled,
    onClick
  } = props;
  
  const baseClass =
    variant === 'primary'
      ? 'rounded bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-500 disabled:opacity-50'
      : 'rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
  
  return (
    <button
      type={type}
      className={`${baseClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;