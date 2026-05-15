import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className, children, ...props }: Props) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-card border border-gray-100/80',
        padded && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
