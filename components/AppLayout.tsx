import { BottomNav } from './BottomNav';

interface Props {
  children: React.ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-cream pb-[72px]">
      {children}
      <BottomNav />
    </div>
  );
}
