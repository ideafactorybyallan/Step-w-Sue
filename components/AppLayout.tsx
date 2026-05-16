'use client';
import { BottomNav } from './BottomNav';
import { useStaleReload } from '@/lib/use-stale-reload';

interface Props {
  children: React.ReactNode;
}

export function AppLayout({ children }: Props) {
  useStaleReload();
  return (
    <div className="min-h-screen bg-cream pb-[56px]">
      {children}
      <BottomNav />
    </div>
  );
}
