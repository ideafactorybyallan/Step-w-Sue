import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const stats = [
  { icon: '💰', color: '#F5C518', sub: '$40 buy-in',   label: 'Big prizes' },
  { icon: '📅', color: '#2BB8AA', sub: '4 weeks',      label: 'Weekly winners' },
  { icon: '👟', color: '#E8234A', sub: 'Track steps',  label: 'Every step counts' },
  { icon: '🏆', color: '#1B2F5E', sub: 'Compete',      label: 'Family glory' },
];

export default async function WelcomePage() {
  const session = await getSession();
  if (session) redirect('/home');

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, message')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-navy px-6 pt-14 pb-10 text-center relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-sw-pink/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sw-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-6 right-4 text-7xl opacity-10 select-none" aria-hidden="true">🍁</div>
        <div className="absolute bottom-6 left-4 text-7xl opacity-10 select-none" aria-hidden="true">👟</div>

        <p className="font-body text-sw-teal text-xs font-bold tracking-[0.2em] uppercase mb-3">
          Sue's 3rd Official Annual
        </p>

        <div className="leading-none mb-1">
          <span className="font-display text-white text-5xl">VICTORIA </span>
          <span className="text-2xl">🍁</span>
          <span className="font-display text-white text-5xl"> DAY</span>
        </div>

        <p className="font-display text-sw-pink text-8xl leading-none tracking-tight">STEP</p>
        <p className="font-display text-white text-5xl leading-none mb-6">CHALLENGE!</p>

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sw-teal opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sw-teal" />
          </span>
          <p className="font-body text-white font-semibold text-sm">2026 Challenge is OPEN</p>
        </div>

        <div className="text-white/70 font-body text-sm">
          <p className="font-semibold text-white">May 18 – June 14, 2026</p>
          <p className="text-xs mt-0.5">4 weeks · Ontario, Canada</p>
        </div>
      </div>

      {/* ── Announcements ─────────────────────────────────────────────────── */}
      {announcements && announcements.length > 0 && (
        <div className="px-4 pt-5 space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-gold/15 border border-gold/40 rounded-xl p-4 flex items-start gap-2"
            >
              <span className="text-base shrink-0">📢</span>
              <p className="font-body text-navy text-sm font-medium">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 gap-4">
        <p className="font-body text-navy/70 text-center text-base font-medium -mb-1">
          The Perfect Excuse To Get Your Wheels Moving!
        </p>

        <Link href="/join">
          <button className="w-full bg-sw-pink text-white font-display text-3xl py-5 rounded-2xl shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 tracking-wide">
            TAP HERE, JOIN THE CHALLENGE 🏃
          </button>
        </Link>

        <Link href="/login">
          <button className="w-full bg-white text-navy font-body font-bold text-lg py-4 rounded-2xl border-2 border-navy/20 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
            Sign Back In
          </button>
        </Link>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {stats.map(({ icon, color, sub, label }) => (
            <div key={icon} className="bg-white rounded-2xl p-4 text-center shadow-card">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl mx-auto mb-2"
                style={{ backgroundColor: color + '20' }}
              >
                <span>{icon}</span>
              </div>
              <p className="font-body text-xs font-bold text-navy">{label}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="bg-navy py-4 text-center">
        <p className="text-white/50 font-body text-xs">
          ❤️ Every step counts · Let's make this our best year yet!
        </p>
      </div>
    </div>
  );
}
