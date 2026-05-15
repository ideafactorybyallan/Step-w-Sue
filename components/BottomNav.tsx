'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Footprints } from 'lucide-react';
import { clsx } from 'clsx';

const tabs = [
  { href: '/home',        label: 'Home',       Icon: Home },
  { href: '/leaderboard', label: 'Standings',  Icon: Trophy },
  { href: '/steps',       label: 'My Steps',   Icon: Footprints },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-navy border-t-2 border-sw-pink/30 z-50 safe-area-pb">
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-h-[56px]',
                active ? 'text-sw-pink' : 'text-white/50'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={clsx('text-xs font-body', active ? 'font-semibold' : 'font-normal')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
