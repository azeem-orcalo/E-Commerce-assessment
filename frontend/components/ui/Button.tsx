'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  fullWidth?: boolean;
}

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-brand-900 text-white hover:bg-brand-700 disabled:bg-brand-300 disabled:text-brand-500',
    ghost:
      'border border-brand-900 text-brand-900 hover:bg-brand-100 disabled:border-brand-300 disabled:text-brand-400',
  };

  return (
    <button
      disabled={disabled || loading}
      className={[base, variants[variant], fullWidth ? 'w-full' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Processing…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
