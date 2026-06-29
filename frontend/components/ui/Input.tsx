'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wider uppercase text-brand-600"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-3.5 py-3 text-sm text-brand-900 bg-white',
            'border border-brand-300 outline-none',
            'transition-all duration-150',
            'placeholder:text-brand-400',
            'focus:border-brand-900 focus:ring-1 focus:ring-brand-900',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-400' : '',
            'disabled:bg-brand-100 disabled:cursor-not-allowed disabled:text-brand-400',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {error && <p className="field-error">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
