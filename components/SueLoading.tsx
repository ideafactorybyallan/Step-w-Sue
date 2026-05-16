'use client';
import { useEffect, useState } from 'react';
import { SueMark } from './marks';
import { sueFor } from '@/lib/sue-says';

// Branded loading skeleton. Replaces the generic pulse boxes with shimmer
// silhouettes that mirror the real layout, plus a centered Sue mark and
// a rotating quote so the wait feels intentional.
export function SueLoading() {
  const [quote, setQuote] = useState<string>(sueFor('loading'));

  useEffect(() => {
    const id = setInterval(() => setQuote(sueFor('loading')), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header silhouette */}
      <div className="bg-hero-navy-tight px-6 pt-10 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-sw-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="shimmer h-3 w-24 rounded bg-white/10 mb-3" />
        <div className="shimmer h-12 w-56 rounded bg-white/10" />
        <div className="shimmer h-4 w-40 rounded bg-white/10 mt-3" />
      </div>

      {/* Centered Sue mark + quote */}
      <div className="flex flex-col items-center justify-center pt-7 pb-4">
        <SueMark className="w-12 h-12 mb-3" />
        <p
          key={quote}
          className="font-body italic text-navy/60 text-sm text-center px-8 max-w-xs animate-fade-up"
        >
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      {/* Card silhouettes */}
      <div className="px-4 pb-6 space-y-3">
        <div className="shimmer h-32 bg-white rounded-2xl shadow-el-2" />
        <div className="shimmer h-24 bg-white rounded-2xl shadow-el-2" />
        <div className="shimmer h-40 bg-white rounded-2xl shadow-el-2" />
      </div>
    </div>
  );
}
