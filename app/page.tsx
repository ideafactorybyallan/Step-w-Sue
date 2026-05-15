import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
        {/* Decorative background icons */}
        <div className="absolute top-6 right-4 text-7xl opacity-10 select-none">🍁</div>
        <div className="absolute bottom-6 left-4 text-7xl opacity-10 select-none">👟</div>

        <p className="font-body text-sw-teal text-xs font-bold tracking-[0.2em] uppercase mb-2">
          Sue's 3rd Official Annual
        </p>

        <div className="leading-none mb-1">
          <span className="font-display text-white text-5xl">VICTORIA </span>
          <span className="text-2xl">🍁</span>
          <span className="font-display text-white text-5xl"> DAY</span>
        </div>

        <p className="font-display text-sw-pink text-8xl leading-none tracking-tight">STEP</p>
        <p className="font-display text-white text-5xl leading-none mb-5">CHALLENGE!</p>

        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
          <span className="text-sm">🏆</span>
          <p className="font-body text-white font-semibold text-sm">2026 Challenge is OPEN</p>
        </div>

        <div className="text-white/70 font-body text-sm">
          <p className="font-semibold text-white">May 18 – June 14, 2026</p>
          <p className="text-xs mt-0.5">4 weeks · Ontario, Canada</p>
        </div>
      </div>

      {/* ── Tagline banner ────────────────────────────────────────────────── */}
      <div className="bg-sw-teal py-3 text-center">
        <p className="font-display text-white text-2xl tracking-wide">
          STEP UP. SHOW UP. LET'S GO!
        </p>
      </div>

      {/* ── Announcements ─────────────────────────────────────────────────── */}
      {announcements && announcements.length > 0 && (
        <div className="px-4 pt-4 space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-gold/15 border border-gold/40 rounded-xl p-3 text-center"
            >
              <p className="font-body text-navy text-sm font-medium">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 gap-4">
        <Link href="/join">
          <button className="w-full bg-sw-pink text-white font-display text-3xl py-5 rounded-2xl shadow-lg active:scale-95 transition-transform tracking-wide">
            JOIN THE CHALLENGE 🏃
          </button>
        </Link>

        <Link href="/login">
          <button className="w-full bg-white text-navy font-body font-bold text-lg py-4 rounded-2xl border-2 border-navy shadow active:scale-95 transition-transform">
            I Already Have an Account
          </button>
        </Link>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { icon: '💰', sub: '$40 buy-in', label: 'Big prizes' },
            { icon: '📅', sub: '4 weeks',    label: 'Weekly winners' },
            { icon: '👟', sub: 'Track steps', label: 'Every step counts' },
            { icon: '🏆', sub: 'Compete',    label: 'Family glory' },
          ].map(({ icon, sub, label }) => (
            <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl">{icon}</p>
              <p className="font-body text-xs text-gray-400 mt-1">{sub}</p>
              <p className="font-body text-xs font-bold text-navy">{label}</p>
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
