import type { ChangeEventHandler } from 'react';

interface InputProps {
  label: string;
  error?: string;
  id?: string;
  name?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  type?: string;
}

const Input = (props: InputProps) => {
  const {
    label,
    error,
    id,
    name,
    value,
    onChange,
    className,
    placeholder,
    disabled,
    autoComplete,
    type = 'text'
  } = props;

  return (
    <div className={className}>
      <label className="mb-0.5 block text-sm text-slate-700 dark:text-slate-300">
        {label}
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Input;