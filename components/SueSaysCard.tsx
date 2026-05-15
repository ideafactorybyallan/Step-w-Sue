'use client';
import { useState } from 'react';
import { Card } from './ui/Card';
import { RefreshCw } from 'lucide-react';
import { SUE_SAYS_QUOTES } from '@/lib/sue-says';

export function SueSaysCard() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SUE_SAYS_QUOTES.length));

  return (
    <Card className="border-l-4 border-sw-teal bg-sw-teal/5">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">💬</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-body font-semibold text-sw-teal uppercase tracking-wider mb-1">
            Sue Says
          </p>
          <p className="font-body text-navy text-sm leading-relaxed">
            &ldquo;{SUE_SAYS_QUOTES[idx]}&rdquo;
          </p>
        </div>
        <button
          onClick={() =>
            setIdx((i) => {
              const next = Math.floor(Math.random() * SUE_SAYS_QUOTES.length);
              return next === i ? (next + 1) % SUE_SAYS_QUOTES.length : next;
            })
          }
          className="shrink-0 text-sw-teal/60 hover:text-sw-teal transition-colors p-1"
          aria-label="New quote"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </Card>
  );
}
