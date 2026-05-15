'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Footprints } from 'lucide-react';
import { clsx } from 'clsx';

const tabs = [
  { href: '/home',        label: 'Home',      Icon: Home },
  { href: '/leaderboard', label: 'Standings', Icon: Trophy },
  { href: '/steps',       label: 'My Steps',  Icon: Footprints },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-navy/95 backdrop-blur-sm border-t border-white/10 z-50 safe-area-pb">
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center pt-2 pb-3 gap-0.5 min-h-[60px] transition-opacity"
            >
              {/* Active indicator bar */}
              <div className={clsx(
                'w-8 h-0.5 rounded-full mb-1 transition-all duration-200',
                active ? 'bg-sw-pink' : 'bg-transparent'
              )} />
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={clsx(
                  'transition-all duration-200',
                  active ? 'text-sw-pink scale-110' : 'text-white/45'
                )}
              />
              <span className={clsx(
                'text-xs font-body transition-all duration-200',
                active ? 'text-sw-pink font-semibold' : 'text-white/45 font-normal'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
