import { clsx } from 'clsx';

interface Props {
  children: React.ReactNode;
  colorClass?: string;
  className?: string;
}

export function Badge({ children, colorClass = 'bg-navy/10 text-navy border-navy/20', className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-body font-medium px-2 py-0.5 rounded-full border',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}
