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
  primary:   'bg-sw-pink text-white shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-btn',
  secondary: 'bg-navy text-white shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-btn',
  teal:      'bg-sw-teal text-white shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-btn',
  ghost:     'bg-white text-navy border-2 border-navy hover:bg-gray-50 active:bg-gray-100 active:scale-[0.97]',
  danger:    'bg-red-500 text-white shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm py-2 px-4 rounded-xl',
  md: 'text-base py-3 px-6 rounded-2xl',
  lg: 'text-lg py-4 px-6 rounded-2xl font-semibold',
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

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
        'font-body transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sw-pink focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-btn w-full',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
