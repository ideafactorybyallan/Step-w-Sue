'use client';
import { useState, useCallback } from 'react';
import { Card } from './ui/Card';
import { RefreshCw } from 'lucide-react';
import { SUE_SAYS_QUOTES } from '@/lib/sue-says';
import { SueMark } from './marks';

export function SueSaysCard() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SUE_SAYS_QUOTES.length));
  const [fading, setFading] = useState(false);

  const nextQuote = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIdx((i) => {
        const next = Math.floor(Math.random() * SUE_SAYS_QUOTES.length);
        return next === i ? (next + 1) % SUE_SAYS_QUOTES.length : next;
      });
      setFading(false);
    }, 160);
  }, []);

  return (
    <Card className="border-l-4 border-sw-teal bg-sw-teal/5 shadow-el-2">
      <div className="flex items-start gap-3">
        <SueMark className="w-9 h-9 shrink-0 mt-0.5 [filter:drop-shadow(0_2px_6px_rgba(43,184,170,0.35))]" />
        <div className="flex-1 min-w-0">
          <p className="display-xs text-sw-teal-dark mb-0.5">SUE SAYS</p>
          <p
            className="font-body text-navy text-sm leading-relaxed transition-opacity duration-150"
            style={{ opacity: fading ? 0 : 1 }}
          >
            &ldquo;{SUE_SAYS_QUOTES[idx]}&rdquo;
          </p>
        </div>
        <button
          onClick={nextQuote}
          className="shrink-0 text-sw-teal/60 hover:text-sw-teal active:scale-[0.82] active:rotate-180 transition-all duration-300 p-1"
          aria-label="New quote"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </Card>
  );
}
