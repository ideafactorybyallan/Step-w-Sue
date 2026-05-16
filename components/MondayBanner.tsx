import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SueMark } from './marks';

// Time-of-day awareness so the glow doesn't pulse in the middle of the night.
function isWakingHoursEDT(): boolean {
  try {
    const now = new Date();
    const hourEDT = parseInt(
      now.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/New_York' })
    );
    return hourEDT >= 6 && hourEDT < 22;
  } catch {
    return true;
  }
}

export function MondayBanner() {
  const pulse = isWakingHoursEDT();
  return (
    <div className={`relative overflow-hidden bg-gradient-pink shadow-el-3 ${pulse ? 'animate-glow-pulse' : ''}`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/15 rounded-full blur-2xl pointer-events-none" />
      <div className="relative px-4 py-4 flex items-center gap-3">
        <SueMark variant="wave" className="w-11 h-11 shrink-0 [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.2))]" />
        <div className="flex-1 min-w-0">
          <p className="display-sm text-white leading-none">SUBMISSION MONDAY</p>
          <p className="font-body text-white/90 text-xs mt-1 leading-snug">
            Lock in last week before midnight EDT. Sue is awake.
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
