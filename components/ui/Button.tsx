'use client';
import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'teal' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:   'bg-sw-pink text-white active:bg-sw-pink-dark shadow-md',
  secondary: 'bg-navy text-white active:bg-navy-dark shadow-md',
  teal:      'bg-sw-teal text-white active:bg-sw-teal-dark shadow-md',
  ghost:     'bg-white text-navy border-2 border-navy active:bg-gray-50',
  danger:    'bg-red-500 text-white active:bg-red-600 shadow-md',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm py-2 px-4 rounded-xl',
  md: 'text-base py-3 px-6 rounded-2xl',
  lg: 'text-lg py-4 px-6 rounded-2xl font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        'font-body transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
}
