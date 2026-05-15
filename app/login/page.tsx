'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PinInput } from '@/components/PinInput';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
}

type Stage = 'pick' | 'pin';

const AVATAR_COLORS = ['#E8234A', '#2BB8AA', '#1B2F5E', '#F5C518', '#8B5CF6'];

function avatarColor(name: string): string {
  const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function avatarTextColor(bg: string): string {
  return bg === '#F5C518' ? '#1B2F5E' : '#ffffff';
}

export default function LoginPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [pin, setPin] = useState('');
  const [stage, setStage] = useState<Stage>('pick');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/participants')
      .then((r) => r.json())
      .then((data) => setParticipants(data))
      .finally(() => setLoadingList(false));
  }, []);

  const handleSelect = (p: Participant) => {
    setSelected(p);
    setPin('');
    setError('');
    setStage('pin');
  };

  const handleLogin = async () => {
    if (!selected || pin.length < 4) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: selected.id, pin }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        setPin('');
        return;
      }
      router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <div className="bg-navy px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <p className="font-body text-white/60 text-sm">Step w Sue</p>
        </div>
        <p className="font-display text-sw-pink text-5xl leading-none">SIGN</p>
        <p className="font-display text-white text-3xl leading-none">BACK IN</p>
      </div>

      <div className="flex-1 px-6 py-8">

        {/* ── Stage: pick name ─────────────────────────────────────────── */}
        {stage === 'pick' && (
          <div className="space-y-4 animate-fade-up">
            <div className="text-center">
              <p className="text-4xl mb-2">👋</p>
              <p className="font-display text-navy text-2xl">WHO ARE YOU?</p>
              <p className="font-body text-sm text-gray-500 mt-1">Tap your name to continue.</p>
            </div>

            {loadingList ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-body text-gray-500 text-sm">No accounts yet.</p>
                <Link href="/join" className="text-sw-pink font-semibold font-body text-sm">
                  Join the challenge →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((p) => {
                  const bg = avatarColor(p.first_name);
                  const fg = avatarTextColor(bg);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      className="w-full bg-white rounded-2xl p-4 text-left border-2 border-transparent active:border-sw-pink active:bg-sw-pink/5 transition-all shadow-card hover:shadow-card-hover flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-base shrink-0"
                        style={{ backgroundColor: bg, color: fg }}
                      >
                        {p.first_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-bold text-navy text-base">
                          {p.first_name} {p.last_name}
                        </p>
                        {p.nickname && (
                          <p className="font-body text-xs text-gray-400 mt-0.5">"{p.nickname}"</p>
                        )}
                      </div>
                      <ChevronLeft size={18} className="text-gray-300 rotate-180 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            <p className="font-body text-xs text-gray-400 text-center pt-2">
              Not on the list?{' '}
              <Link href="/join" className="text-sw-pink font-semibold">
                Join the challenge
              </Link>
            </p>
          </div>
        )}

        {/* ── Stage: enter PIN ─────────────────────────────────────────── */}
        {stage === 'pin' && selected && (
          <div className="space-y-6 animate-fade-up">
            {/* Selected user chip */}
            <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-base shrink-0"
                style={{
                  backgroundColor: avatarColor(selected.first_name),
                  color: avatarTextColor(avatarColor(selected.first_name)),
                }}
              >
                {selected.first_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-body font-bold text-navy text-sm">
                  {selected.first_name} {selected.last_name}
                </p>
                {selected.nickname && (
                  <p className="font-body text-xs text-gray-400">"{selected.nickname}"</p>
                )}
              </div>
              <div className="w-5 h-5 rounded-full bg-sw-teal flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <div className="text-center">
              <p className="font-display text-navy text-2xl">ENTER YOUR PIN</p>
              <p className="font-body text-sm text-gray-500 mt-1">4-digit PIN to sign in</p>
            </div>

            <PinInput value={pin} onChange={setPin} error={error || undefined} label="" />

            <Button onClick={handleLogin} loading={loading} disabled={pin.length < 4} size="lg">
              Sign In 👟
            </Button>

            <button
              onClick={() => { setStage('pick'); setPin(''); setError(''); }}
              className="w-full font-body text-sm text-gray-500 py-2 hover:text-navy transition-colors"
            >
              ← That's not me
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
