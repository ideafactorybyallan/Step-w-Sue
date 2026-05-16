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
    <nav className="fixed bottom-0 inset-x-0 bg-navy/95 backdrop-blur-sm border-t border-white/10 z-50 safe-area-pb">
      <div className="flex relative">
        {tabs.map(({ href, label, Icon }) => {
          const active = activePath.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={() => handleTap(href)}
              className="relative flex-1 flex flex-col items-center justify-center pt-1.5 pb-1.5 gap-1 min-h-[48px] transition-transform duration-100 active:scale-[0.92] active:opacity-70"
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-sw-pink"
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className={clsx(
                  'transition-colors duration-150',
                  active ? 'text-sw-pink' : 'text-white/45'
                )}
              />
              <span className={clsx(
                'text-[11px] font-body leading-none transition-colors duration-150',
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
