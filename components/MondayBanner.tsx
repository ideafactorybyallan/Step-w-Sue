'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SueMark } from './marks';

// Minutes remaining until midnight EDT (UTC-4)
function minutesUntilMidnightEDT(): number {
  const nowUtcMs = Date.now();
  const edtMs = nowUtcMs - 4 * 60 * 60 * 1000; // shift to EDT
  const edtDate = new Date(edtMs);
  const minutesElapsed = edtDate.getUTCHours() * 60 + edtDate.getUTCMinutes();
  return 1440 - minutesElapsed; // 1440 = 24 * 60
}

function isWakingHours(): boolean {
  const mins = minutesUntilMidnightEDT();
  const elapsed = 1440 - mins;
  return elapsed >= 6 * 60 && elapsed < 22 * 60;
}

function formatCountdown(mins: number): string {
  if (mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function MondayBanner() {
  const [minsLeft, setMinsLeft] = useState(minutesUntilMidnightEDT);
  const [pulse, setPulse] = useState(isWakingHours);

  useEffect(() => {
    const id = setInterval(() => {
      setMinsLeft(minutesUntilMidnightEDT());
      setPulse(isWakingHours());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const showCountdown = minsLeft <= 180; // show when ≤ 3 hours left
  const critical = minsLeft <= 60;

  return (
    <div className={`relative overflow-hidden bg-gradient-pink shadow-el-3 ${pulse ? 'animate-glow-pulse' : ''}`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/15 rounded-full blur-2xl pointer-events-none" />
      <div className="relative px-4 py-4 flex items-center gap-3">
        <SueMark variant="wave" className="w-11 h-11 shrink-0 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.2))]" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="display-sm text-white leading-none">SUBMISSION MONDAY</p>
            {showCountdown && (
              <span
                className={`font-body font-bold text-xs rounded-full px-2 py-0.5 tabular-nums ${
                  critical
                    ? 'bg-white/25 text-white animate-pulse'
                    : 'bg-white/15 text-white/90'
                }`}
              >
                {formatCountdown(minsLeft)}
              </span>
            )}
          </div>
          <p className="font-body text-white/90 text-xs mt-1 leading-snug">
            {critical
              ? 'Final hour — lock it in before midnight EDT.'
              : 'Lock in last week before midnight EDT. Sue is awake.'}
          </p>
        </div>
        <Link
          href="/steps"
          className="shrink-0 inline-flex items-center gap-0.5 bg-white text-sw-pink font-body font-bold text-xs rounded-full px-3 py-1.5 shadow-el-1 active:scale-[0.92] transition-transform duration-150 ease-spring"
        >
          SUBMIT
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
