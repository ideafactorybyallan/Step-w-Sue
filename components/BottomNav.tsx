'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Trophy, Footprints } from 'lucide-react';
import { clsx } from 'clsx';

const tabs = [
  { href: '/home',        label: 'Home',      Icon: Home },
  { href: '/leaderboard', label: 'Standings', Icon: Trophy },
  { href: '/steps',       label: 'My Steps',  Icon: Footprints },
];

export function BottomNav() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (pendingHref && pathname.startsWith(pendingHref)) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  const activePath = pendingHref ?? pathname;

  const handleTap = (href: string) => {
    if (pathname.startsWith(href)) return;
    setPendingHref(href);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-navy border-t border-white/10 z-50 safe-area-pb">
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = activePath.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={() => handleTap(href)}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[48px] select-none will-change-transform transition-transform duration-200 ease-spring active:scale-[0.80]"
            >
              <span className={clsx(
                'flex items-center justify-center w-14 h-6 rounded-full transition-all duration-200 ease-spring',
                active ? 'bg-sw-pink/20 shadow-[0_0_10px_rgba(232,35,74,0.25)]' : ''
              )}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={clsx(
                    'transition-colors duration-150',
                    active
                      ? 'text-sw-pink drop-shadow-[0_0_6px_rgba(232,35,74,0.7)]'
                      : 'text-white/50'
                  )}
                />
              </span>
              <span className={clsx(
                'font-body text-[10px] leading-none transition-colors duration-150',
                active ? 'text-sw-pink font-semibold' : 'text-white/45'
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
