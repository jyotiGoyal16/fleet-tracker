import type { ChangeEventHandler } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  error?: string;
  id?: string;
  name?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  className?: string;
  disabled?: boolean;
}

const Select = (props: SelectProps) => {
  const {
    label,
    options,
    error,
    id,
    name,
    value,
    onChange,
    className,
    disabled,
  } = props;

  return (
    <div className={className}>
      <label className="mb-0.5 block text-sm text-slate-700 dark:text-slate-300">
        {label}
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Select;